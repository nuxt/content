import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { withoutTrailingSlash, hasProtocol } from 'ufo'
import { pascalCase } from 'scule'
import { useRuntimeConfig, addRouteMiddleware, callWithNuxt, navigateTo, useRoute, defineNuxtPlugin, prefetchComponents, useRouter } from '#app'
import type { MarkdownNode, NavItem, ParsedContent } from '../../types'
import type { ModuleOptions } from '../../../module'
import { useContentState } from '../../composables/content'
import { useContentHelpers } from '../../composables/helpers'
import { fetchContentNavigation } from '../composables/navigation'
import { queryContent } from '../composables/query'
import { componentNames } from '#components'
// @ts-ignore
import layouts from '#build/layouts'

export default defineNuxtPlugin((nuxt) => {
  const moduleOptions = useRuntimeConfig()?.public?.content.documentDriven as unknown as Exclude<ModuleOptions['documentDriven'], boolean>
  const isClientDBEnabled = useRuntimeConfig()?.public?.content.experimental.clientDB
  const { navigation, pages, globals, surrounds } = useContentState()

  /**
   * Finds a layout value from a cascade of objects.
   */
  const findLayout = (to: RouteLocationNormalized, page: ParsedContent, navigation: NavItem[], globals: Record<string, any>) => {
    // Page `layout` key has priority
    if (page && page?.layout) { return page.layout }

    // Resolve key from .vue page meta
    if (to.matched.length && to.matched[0].meta?.layout) { return to.matched[0].meta.layout }

    // Resolve key from navigation
    if (navigation && page) {
      const { navKeyFromPath } = useContentHelpers()
      const layoutFromNav = navKeyFromPath(page._path!, 'layout', navigation)
      if (layoutFromNav) { return layoutFromNav }
    }

    // Resolve key from globals fallback
    if (moduleOptions.layoutFallbacks && globals) {
      let layoutFallback
      for (const fallback of moduleOptions.layoutFallbacks) {
        if (globals[fallback] && globals[fallback].layout) {
          layoutFallback = globals[fallback].layout
          break
        }
      }
      if (layoutFallback) { return layoutFallback }
    }

    return 'default'
  }

  const refresh = async (to: RouteLocationNormalized | RouteLocationNormalizedLoaded, dedup = false) => {
    // Call hook before fetching content
    // @ts-ignore
    nuxt.callHook('content:document-driven:start', { route: to, dedup })

    const routeConfig = (to.meta.documentDriven || {}) as any
    // Disabled document driven mode on next route
    if (to.meta.documentDriven === false) {
      return
    }

    // Normalize route path
    const _path = withoutTrailingSlash(to.path)

    // Promises array to be executed all at once
    const promises: (() => Promise<any> | any)[] = []

    /**
     *
     * `navigation`
     */
    if (moduleOptions.navigation && routeConfig.navigation !== false) {
      const navigationQuery = () => {
        const { navigation } = useContentState()

        if (navigation.value && !dedup) { return navigation.value }

        return fetchContentNavigation()
          .then((_navigation) => {
            navigation.value = _navigation
            return _navigation
          })
          .catch(() => null)
      }

      promises.push(navigationQuery)
    } else {
      promises.push(() => Promise.resolve(null))
    }

    /**
     * `globals`
     */
    if (moduleOptions.globals) {
      const globalsQuery = () => {
        const { globals } = useContentState()

        if (
          typeof moduleOptions.globals === 'object' && Array.isArray(moduleOptions.globals)
        ) {
          // eslint-disable-next-line no-console
          console.log('Globals must be a list of keys with QueryBuilderParams as a value.')
          return
        }

        return Promise.all(
          Object.entries(moduleOptions.globals!).map(
            ([key, query]: [string, any]) => {
              // Avoid fetching same file twice
              if (!dedup && globals.value[key]) { return globals.value[key] }

              // Supports `find` if passed as `query: 'find'` in the query definition.
              let type = 'findOne'
              if (query?.type) { type = query.type }

              return (queryContent(query) as any)[type]().catch(() => null)
            }
          )
        ).then(
          (values) => {
            return values.reduce(
              (acc, value, index) => {
                const key = Object.keys(moduleOptions.globals!)[index]

                acc[key] = value

                return acc
              }, {})
          }
        )
      }

      promises.push(globalsQuery)
    } else {
      promises.push(() => Promise.resolve(null))
    }

    /**
     * `page`
     */
    if (moduleOptions.page && routeConfig.page !== false) {
      let where = { _path }
      if (typeof routeConfig.page === 'string') {
        where = { _path: routeConfig.page }
      }
      if (typeof routeConfig.page === 'object') {
        where = routeConfig.page
      }
      const pageQuery = () => {
        const { pages } = useContentState()

        // Return same page as page is already loaded
        if (!dedup && pages.value[_path] && pages.value[_path]._path === _path) {
          return pages.value[_path]
        }

        return queryContent()
          .where(where)
          .findOne()
          .catch(() => null)
      }

      promises.push(pageQuery)
    } else {
      promises.push(() => Promise.resolve(null))
    }

    /**
     * `surround`
     */
    if (moduleOptions.surround && routeConfig.surround !== false) {
      let surround: any = _path
      if (['string', 'object'].includes(typeof routeConfig.page)) {
        surround = routeConfig.page
      }
      if (['string', 'object'].includes(typeof routeConfig.surround)) {
        surround = routeConfig.surround
      }
      const surroundQuery = () => {
        const { surrounds } = useContentState()

        // Return same surround as page is already loaded
        if (!dedup && surrounds.value[_path]) {
          return surrounds.value[_path]
        }

        return queryContent()
          .where({
            _partial: { $not: true },
            navigation: { $not: false }
          })
        // Exclude `body` for `surround`
          .without(['body'])
          .findSurround(surround)
          .catch(() => null)
      }

      promises.push(surroundQuery)
    } else {
      promises.push(() => Promise.resolve(null))
    }

    return await Promise.all(promises.map(promise => promise())).then(async ([
      _navigation,
      _globals,
      _page,
      _surround
    ]) => {
      if (_navigation) {
        navigation.value = _navigation
      }

      if (_globals) {
        globals.value = _globals
      }

      if (_surround) {
        surrounds.value[_path] = _surround
      }

      // Use `redirect` key to redirect to another page
      const redirectTo = _page?.redirect || _page?._dir?.navigation?.redirect
      if (redirectTo) {
        // In case of redirection, it is not necessary to fetch page layout
        // Just fill the page state with the redirect path
        pages.value[_path] = _page
        return redirectTo
      }

      if (_page) {
        // Find used layout
        const layoutName = findLayout(to, _page, _navigation, _globals)

        // Prefetch layout component
        const layout = layouts[layoutName]

        if (layout && typeof layout === 'function') {
          await layout()
        }
        // Apply layout
        to.meta.layout = layoutName
        _page.layout = layoutName
      }

      // Update values
      pages.value[_path] = _page

      // Call hook after content is fetched
      // @ts-ignore
      await nuxt.callHook('content:document-driven:finish', { route: to, dedup, page: _page, navigation: _navigation, globals: _globals, surround: _surround })
    })
  }

  // Prefetch page content
  if (process.client) {
    const router = useRouter()
    nuxt.hook('link:prefetch', (link) => {
      if (!(link in pages.value) && !hasProtocol(link)) {
        const route = router.resolve(link)
        if (route.matched.length > 0) {
          refresh(route)
        }
      }
    })
    // @ts-expect-error hook is not typed
    nuxt.hooks.hook('content:document-driven:finish', ({ page }) => {
      if (page?.body?.children) {
        prefetchBodyComponents(page.body.children)
      }
    })
  }

  // Route middleware
  addRouteMiddleware(async (to, from) => {
    // Avoid calling on hash change
    if (process.client && !isClientDBEnabled && to.path === from.path) {
      if (!to.meta.layout) {
        const _path = withoutTrailingSlash(to.path)
        if (pages.value[_path]) {
          to.meta.layout = pages.value[_path].layout
        }
      }
      return
    }

    const redirect = await refresh(to, false)

    if (redirect) {
      if (hasProtocol(redirect)) {
        return callWithNuxt(nuxt, navigateTo, [redirect, { external: true }])
      } else {
        return redirect
      }
    }
  })

  // @ts-ignore - Refresh on client-side
  nuxt.hook('app:data:refresh', async () => process.client && await refresh(useRoute(), true))
})

function prefetchBodyComponents (nodes: MarkdownNode[]) {
  for (const node of nodes) {
    if (node.children) {
      prefetchBodyComponents(node.children)
    }
    if (node.type === 'element' && node.tag) {
      const el = pascalCase(node.tag)
      for (const name of ['Prose' + el, el]) {
        if (componentNames.includes(name)) {
          prefetchComponents(name)
        }
      }
    }
  }
}
