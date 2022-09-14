import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
// @ts-ignore
import { useRuntimeConfig, addRouteMiddleware } from '#app'
import { withoutTrailingSlash } from 'ufo'
import { NavItem, ParsedContent } from '../types'
// @ts-ignore
import { defineNuxtPlugin, queryContent, useContentHelpers, useContentState, fetchContentNavigation, useRoute } from '#imports'
// @ts-ignore
import layouts from '#build/layouts'

export default defineNuxtPlugin((nuxt) => {
  const { documentDriven: moduleOptions } = useRuntimeConfig()?.public?.content

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
      const layoutFromNav = navKeyFromPath(page._path, 'layout', navigation)
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

  const refresh = async (to: RouteLocationNormalized | RouteLocationNormalizedLoaded, force: boolean = false) => {
    const routeConfig = (to.meta.documentDriven || {}) as any
    // Disabled document driven mode on next route
    if (to.meta.documentDriven === false) {
      return
    }

    // Expose hook to be used for loading indicators
    !force && nuxt.callHook('content:middleware:start')

    const { navigation, pages, globals, surrounds } = useContentState()

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

        if (navigation.value && !force) { return navigation.value }

        return fetchContentNavigation()
          .then((_navigation) => {
            navigation.value = _navigation
            return _navigation
          })
          .catch((_) => {
            // eslint-disable-next-line no-console
            // console.log('Could not fetch navigation!')
          })
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
          Object.entries(moduleOptions.globals).map(
            ([key, query]: [string, any]) => {
              // Avoid fetching same file twice
              if (!force && globals.value[key]) { return globals.value[key] }

              // Supports `find` if passed as `query: 'find'` in the query definition.
              let type = 'findOne'
              if (query?.type) { type = query.type }

              return queryContent(query)[type]().catch(() => {
                // eslint-disable-next-line no-console
                // console.log(`Could not find globals key: ${key}`)
              })
            }
          )
        ).then(
          (values) => {
            return values.reduce(
              (acc, value, index) => {
                const key = Object.keys(moduleOptions.globals)[index]

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
        if (!force && pages.value[_path] && pages.value[_path]._path === _path) {
          return pages.value[_path]
        }

        return queryContent()
          .where(where)
          .findOne()
          .catch(() => {
            // eslint-disable-next-line no-console
            // console.log(`Could not find page: ${to.path}`)
          })
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
        if (!force && surrounds.value[_path]) {
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
          .catch(() => {
            // eslint-disable-next-line no-console
            // console.log(`Could not find surrounding pages for: ${to.path}`)
          })
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

      // Use `redirect` key to redirect to another page
      if (_page?.redirect) { return _page?.redirect }

      if (_page) {
        // Find used layout
        const layoutName = findLayout(to, _page, _navigation, _globals)

        // Prefetch layout component
        const layout = layouts[layoutName]

        if (layout && layout?.__asyncLoader && !layout.__asyncResolved) {
          await layout.__asyncLoader()
        }
        // Apply layout
        to.meta.layout = layoutName

        // Update values
        pages.value[_path] = _page
      }

      if (_surround) {
        surrounds.value[_path] = _surround
      }
    })
  }

  // Route middleware
  addRouteMiddleware(async (to, from) => {
    // TODO: Remove this (https://github.com/nuxt/framework/pull/5274)
    if (to.path.includes('favicon.ico')) { return }
    // Avoid calling on hash change
    if (process.client && !useRuntimeConfig().content.spa && to.path === from.path) { return }

    const redirect = await refresh(to, false)

    if (redirect) { return redirect }
  })

  // @ts-ignore - Refresh on client-side
  nuxt.hook('app:data:refresh', async () => process.client && await refresh(useRoute(), true))
})
