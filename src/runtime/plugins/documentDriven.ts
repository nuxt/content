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
    const { navigation, page, globals, surround } = useContentState()

    // Normalize route path
    const _path = withoutTrailingSlash(to.path)

    const promises: (() => Promise<any> | any)[] = []

    /**
     *
     * `navigation`
     */
    if (moduleOptions.navigation) {
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
    }

    /**
     * `page`
     */
    if (moduleOptions.page) {
      const pageQuery = () => {
        const { page } = useContentState()

        // Return same page as page is already loaded
        if (!force && page.value && page.value._path === _path) {
          return page.value
        }

        return queryContent()
          .where({ _path })
          .findOne()
          .catch(() => {
            // eslint-disable-next-line no-console
            // console.log(`Could not find page: ${to.path}`)
          })
      }

      promises.push(pageQuery)
    }

    /**
     * `surround`
     */
    if (moduleOptions.surround) {
      const surroundQuery = () => {
        // Return same surround as page is already loaded
        if (!force && page.value && page.value._path === _path) {
          return surround.value
        }

        return queryContent()
          .where({
            _partial: { $not: true },
            navigation: { $not: false }
          })
        // Exclude `body` for `surround`
          .without(['body'])
          .findSurround(_path)
          .catch(() => {
            // eslint-disable-next-line no-console
            // console.log(`Could not find surrounding pages for: ${to.path}`)
          })
      }

      promises.push(surroundQuery)
    }

    return await Promise.all(promises.map(promise => promise())).then(async ([
      _navigation,
      _globals,
      _page,
      _surround
    ]) => {
      // Find used layout
      const layoutName = findLayout(to, _page, _navigation, _globals)

      // Prefetch layout component
      const layout = layouts[layoutName]

      if (layout && layout?.__asyncLoader && !layout.__asyncResolved) {
        await layout.__asyncLoader()
      }
      // Apply layout
      to.meta.layout = layoutName

      if (_navigation) {
        navigation.value = _navigation
      }

      if (_globals) {
        globals.value = _globals
      }

      if (_surround) {
        surround.value = _surround
      }

      // Use `redirect` key to redirect to another page
      if (_page?.redirect) { return _page?.redirect }

      if (_page) {
        // Update values
        page.value = _page
      }
    })
  }

  // Route middleware
  addRouteMiddleware(async (to) => {
    // TODO: Remove this (https://github.com/nuxt/framework/pull/5274)
    if (to.path.includes('favicon.ico')) { return }

    const redirect = await refresh(to, false)

    if (redirect) { return redirect }
  })

  // @ts-ignore - Refresh on client-side
  nuxt.hook('app:data:refresh', async () => process.client && await refresh(useRoute(), true))
})
