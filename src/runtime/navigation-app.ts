import { withTrailingSlash } from 'ufo'
import Vue from 'vue'
import type { DocusContent, DocusDocument, NavItem } from '@docus/core'
import type { NuxtApp } from '@nuxt/types/app'
import { Context } from '@nuxt/types'
import type { DocusConfig, DocusCurrentNav, DocusNavigationGetParameters, DocusNavigationState } from 'types'
import { pascalCase } from './scule'
import { StateTypes } from './'
import { unref, useState } from '#app'
import type { Ref } from '#app'

/**
 * Query navigation from and to a certain point using parameters.
 */
let _get: (params: DocusNavigationGetParameters) => {
  title: string | undefined
  to: string | undefined
  parent: NavItem | undefined
  links: any
}

/**
 * Fetch navigation from Docus database.
 */
let _fetchNavigation: (locale?: string) => Promise<void>

/**
 * Filter a list of nodes.
 */
let _filterLinks: (nodes: NavItem[], maxDepth: number, currentDepth: number) => NavItem[]

/**
 * Check if a "to" path is the current path.
 */
let _isLinkActive: (to: string) => boolean

/**
 * Get the page template for a given document.
 */
let _getPageTemplate: (page: DocusDocument) => string

/**
 * Fetch previous and next page.
 */
let _getPreviousAndNextLink: (page: DocusDocument) => Promise<any>

/**
 * Updates the currentNav object from the current path.
 */
let _updateCurrentNav: () => void
/**
 * Refresh the navigation and currentNav object
 */
let _refresh: (locale?: string) => Promise<void>

/**
 * Handling all the navigation querying logic.
 */
export const createDocusNavigation = (
  context: Context,
  config: Ref<DocusConfig>,
  content: DocusContent<any>,
  currentLocale: Ref<string>
) => {
  // @ts-ignore - Extract context
  const _contentLocalePath = context.$contentLocalePath
  const { route } = context
  const _route = unref(route)

  // State
  const docusNavigation = useState(StateTypes.Navigation, () => ({})) as Ref<DocusNavigationState>
  const docusCurrentPath = useState(StateTypes.CurrentPath, () => `/${_route.params.pathMatch}`) as Ref<string>

  _fetchNavigation = async (locale?: string) => {
    const __locale = locale || currentLocale.value

    const data = (await content.fetch('navigation/' + __locale)) as NavItem[]

    docusNavigation.value[__locale] = data
  }

  _get = ({ depth, locale = currentLocale.value, from, all }: DocusNavigationGetParameters = {}) => {
    const nav = docusNavigation.value[locale] || []

    let items = nav
    let match: NavItem | undefined

    // The deepest exclusive navigation that can be found based on `from`
    let exclusiveContent: NavItem | undefined
    // Parent of exclusive Content
    let parent: NavItem | undefined

    // `from` parameter handling
    if (from) {
      let lastMatch: NavItem

      const paths = from.split('/')

      items = paths.reduce((links: NavItem[], path: string, index: number) => {
        // Empty path, skip iteration
        if (!path) return links

        // Remember last matched content
        // This content will use as navigation parent if it has an exclusive decendant
        if (match && match.page) {
          lastMatch = match
        }

        // Find matched content
        match = links.find(item => item.to.split('/')[index] === path)
        if (match) {
          // Update parent and exclusiveContent if the matched content marked as exclusive navigation
          if (match && match.exclusive) {
            parent = lastMatch || parent
            exclusiveContent = match
          }

          return match.children
        }

        return links
      }, items)

      if (exclusiveContent) {
        // Use exclusive links
        items = exclusiveContent.children
      } else {
        items = nav
      }
    }

    return {
      // Matched page info
      title: exclusiveContent && exclusiveContent.title,
      to: exclusiveContent && exclusiveContent.to,
      // Matched parent
      parent,
      // Filter children
      links: all ? items : _filterLinks(items, depth || 1, 1)
    }
  }

  _filterLinks = (nodes: NavItem[], maxDepth: number, currentDepth: number) => {
    return nodes.filter(node => {
      // Navigation as false means that we want that link to be hidden from navigation.
      if (node.hidden) return false

      // We don't want to show drafts.
      if (node.draft === true) return false

      // Check if we aren't to deep
      if (currentDepth && maxDepth > currentDepth) return false

      // Check if marked as nested, if so children will be empty
      if (node.nested === false) node.children = []

      // Loop on current node children if exists
      node.children =
        node.children && node.children.length > 0 ? _filterLinks(node.children, maxDepth, currentDepth + 1) : []

      return node
    })
  }

  _isLinkActive = (to: string) => {
    return withTrailingSlash(docusCurrentPath.value) === withTrailingSlash(_contentLocalePath(to))
  }

  _getPageTemplate = (page: DocusDocument) => {
    let template =
      /**
       * Use template defined in page data
       */
      typeof page.template === 'string' ? page.template : page.template?.self

    /**
     * Look for template in parent pages
     */
    if (!template) {
      // Fetch from nav (root to link) and fallback to config.template
      const slugs: string[] = page.to.split('/').filter(Boolean).slice(0, -1) // no need to get latest slug since it is current page

      let { links } = docusCurrentNav.value || {}

      slugs.forEach((_slug: string, index: number) => {
        // generate full path of parent
        const to = '/' + slugs.slice(0, index + 1).join('/')
        const link = links.find((link: NavItem) => link.to === to)

        if (link?.template) {
          template = link.template || template
        }

        if (!link?.children) return

        links = link.children
      })
    }

    /**
     * Use global template if template is not defined in page data or in parent pages
     */
    if (!template) template = config.value?.template || 'Page'

    template = pascalCase(template)

    if (!Vue.component(template)) {
      // eslint-disable-next-line no-console
      console.error(`Template ${template} does not exists, fallback to Page template.`)

      template = 'Page'
    }

    return template
  }

  _getPreviousAndNextLink = (page: DocusDocument) => {
    return (
      content
        // @ts-ignore
        .search({ deep: true })
        .where({
          language: currentLocale.value,
          // Pages should share same parent
          parent: page.parent,
          // Ignore empty index files
          // Index files that hold no markdown content will not show in bottom navigation
          page: { $ne: false },
          // Only get pages that are not hidden. (navigation != false)
          hidden: { $ne: true },
          // Only get pages that are not redirected
          redirect: { $type: 'undefined' }
        })
        .only(['title', 'slug', 'to'])
        .sortBy('position', 'asc')
        .surround(page.to, { before: 1, after: 1 })
        .fetch()
    )
  }

  _updateCurrentNav = () => {
    docusCurrentNav.value = _get({
      from: docusCurrentPath.value
    })
  }

  _refresh = async currentLocale => {
    console.log('refresh')
    await _fetchNavigation(currentLocale)
    _updateCurrentNav()
  }

  const docusCurrentNav = useState(StateTypes.CurrentNav, () => {
    return _get({ from: `/${_route.params.pathMatch}` })
  }) as Ref<DocusCurrentNav>

  if (process.client) {
    window.onNuxtReady(() => {
      // Preview mode for navigation
      window.$nuxt.$on('docus:content:preview', () => _refresh(currentLocale.value))
      // Update content on update.
      window.$nuxt.$on('content:update', () => _refresh(currentLocale.value))
    })
  }
}

/**
 * Access the navigation state and helpers.
 */
export const useNavigation = () => {
  return {
    state: useNavigationState(),
    currentNav: useCurrentNav(),
    currentPath: useCurrentPath(),
    getPageTemplate: _getPageTemplate,
    fetchNavigation: _fetchNavigation,
    isLinkActive: _isLinkActive,
    updateCurrentNav: _updateCurrentNav,
    getPreviousAndNextLink: _getPreviousAndNextLink,
    get: _get
  }
}

/**
 * Access the navigation state.
 */
export const useNavigationState = () => useState(StateTypes.Navigation) as Ref<DocusNavigationState>

/**
 * Access the current navigation.
 */
export const useCurrentNav = () => useState(StateTypes.CurrentNav) as Ref<DocusCurrentNav>

/**
 * Access the current path.
 */
export const useCurrentPath = () => useState(StateTypes.CurrentPath) as Ref<string>
