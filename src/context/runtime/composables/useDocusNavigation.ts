import { withTrailingSlash } from 'ufo'
import Vue from 'vue'
import { pascalCase } from 'scule'
import { ref, computed } from '@nuxtjs/composition-api'
import type { DocusDocument, NavItem } from '@docus/core'
import { NuxtApp } from '@nuxt/types/app'
import { DocusAddonContext, DocusCurrentNav, DocusNavigationGetParameters } from '../../../types'
import { useContent } from '..'

/**
 * Handling all the navigation querying logic.
 */
export const useDocusNavigation = ({ context, instance: { currentPath, settings } }: DocusAddonContext) => {
  // Nuxt context
  const { app } = context

  // Init navigation state
  const state = ref<{ [language: string]: NavItem[] }>({})

  // Map locales to nav
  app.i18n.locales.forEach((locale: any) => (state.value[locale.code] = []))

  // Compute `currentNav` on every route change
  const fetchCounter = ref(0)

  /**
   * Get navigation from Docus data
   */
  async function fetchNavigation() {
    const content = useContent()

    const navigation = (await content.fetch('navigation/' + app.i18n.locale)) as NavItem[]

    state.value[app.i18n.locale] = navigation

    fetchCounter.value += 1
  }

  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.onNuxtReady($nuxt => {
      $nuxt.$on('docus:content:preview', () => {
        fetchNavigation()
      })
    })
  }

  /**
   * Query navigation from and to a certain point using parameters.
   * @param depth The depth at which you want to go into children.
   * @param locale The locale used for that query. (defaults to the current user locale)
   * @param from A vue-router "to" valid path to start with: "/directory" will make my query start at from this directory.
   */
  function get({ depth, locale, from, all }: DocusNavigationGetParameters = {}) {
    const nav = state.value[locale || app.i18n.locale] || []

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
      // matched page info
      title: exclusiveContent && exclusiveContent.title,
      to: exclusiveContent && exclusiveContent.to,
      // matched parent
      parent,
      // filter children
      links: all ? items : filterLinks(items, depth || 1, 1)
    }
  }

  /**
   * Filter a list of nodes.
   */
  function filterLinks(nodes: NavItem[], maxDepth: number, currentDepth: number) {
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
        node.children && node.children.length > 0 ? filterLinks(node.children, maxDepth, currentDepth + 1) : []

      return node
    })
  }

  /**
   * Check if a "to" path is the currently active path.
   */
  function isLinkActive(to: string) {
    return withTrailingSlash(currentPath) === withTrailingSlash(context.$contentLocalePath(to))
  }

  /**
   * Return the current navigation from the current user path.
   */
  const currentNav = computed<DocusCurrentNav>(() => {
    // eslint-disable-next-line no-unused-expressions
    fetchCounter.value

    // Calculate the navigation based on current path
    return get({
      from: currentPath
    })
  })

  // Update content on update.
  if (process.client) window.onNuxtReady(($nuxt: NuxtApp) => $nuxt.$on('content:update', fetchNavigation))

  function getPageTemplate(page: DocusDocument) {
    let template =
      /**
       * Use template defined in page data
       */
      typeof page.template === 'string' ? page.template : page.template?.self

    /**
     * Look for template in parent pages
     */
    if (!template) {
      // Fetch from nav (root to link) and fallback to settings.template
      const slugs: string[] = page.to.split('/').filter(Boolean).slice(0, -1) // no need to get latest slug since it is current page

      let { links } = currentNav?.value || {}

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
    if (!template) template = settings?.template || 'Page'

    template = pascalCase(template)

    if (!Vue.component(template)) {
      // eslint-disable-next-line no-console
      console.error(`Template ${template} does not exists, fallback to Page template.`)

      template = 'Page'
    }

    return template
  }

  // fetch previous and next page based on navigation
  function getPreviousAndNextLink(page: DocusDocument) {
    const content = useContent()

    return content
      .search({ deep: true })
      .where({
        language: app.i18n.locale,
        // Pages should share same parent
        parent: page.parent,
        // Ignore empty index files
        // Index files that hold no markdown content will not show in bottom navigation
        page: { $ne: false },
        // Only get pages that are not hidden. (navigarions != false)
        hidden: { $ne: true },
        // Only get pages that are not redirected.
        redirect: { $type: 'undefined' }
      })
      .only(['title', 'slug', 'to'])
      .sortBy('position', 'asc')
      .surround(page.to, { before: 1, after: 1 })
      .fetch()
  }

  return {
    state,
    currentNav,
    getPageTemplate,
    fetchNavigation,
    isLinkActive,
    get,
    getPreviousAndNextLink,
    init: fetchNavigation
  }
}

export type DocusNavigation = ReturnType<typeof useDocusNavigation>
