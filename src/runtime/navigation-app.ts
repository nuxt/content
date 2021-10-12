import { withTrailingSlash } from 'ufo'
// @ts-ignore
import Vue from 'vue'
import type { DocusDocument, NavItem } from '@docus/core'
import type { NuxtApp } from '@nuxt/types/app'
import type { DocusCurrentNav, DocusNavigationGetParameters } from 'types'
import { Context } from '@nuxt/types'
import { pascalCase } from './scule'
import { StateTypes, useConfig, useContent } from './'
import { unref, useState } from '#app'
import type { Ref } from '#app'

// Locale proxy
let _locale: string

// contentLocalePath proxy
let _contentLocalePath: any

export interface DocusNavigationContext {
  navigation: { [language: string]: NavItem[] }
  currentNav: DocusCurrentNav
  currentPath: string
}

/**
 * Get navigation from Docus data
 */
async function fetchNavigation(locale?: string) {
  const navigation = useNavigationState()

  const content = useContent()

  const __locale = locale || _locale

  const data = (await content.fetch('navigation/' + __locale)) as NavItem[]

  navigation.value[__locale] = data
}

/**
 * Query navigation from and to a certain point using parameters.
 * @param depth The depth at which you want to go into children.
 * @param locale The locale used for that query. (defaults to the current user locale)
 * @param from A vue-router "to" valid path to start with: "/directory" will make my query start at from this directory.
 */
function get({ depth, locale = _locale, from, all }: DocusNavigationGetParameters = {}) {
  const navigation = useNavigationState()

  const nav = navigation.value[locale] || []

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
  const currenPath = useCurrentPath()

  return withTrailingSlash(currenPath.value) === withTrailingSlash(_contentLocalePath(to))
}

function getPageTemplate(page: DocusDocument) {
  const currentNav = useCurrentNav()

  const config = useConfig()

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

    let { links } = currentNav.value || {}

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

// Fetch previous and next page based on navigation
function getPreviousAndNextLink(page: DocusDocument) {
  const content = useContent()

  return (
    content
      // @ts-ignore
      .search({ deep: true })
      .where({
        language: _locale,
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

/**
 * Handling all the navigation querying logic.
 */
export const createDocusNavigation = (context: Context) => {
  // Nuxt context
  const { app, route } = context

  _locale = app.i18n.locale

  const _route = unref(route)

  const docusNavigation = useState(StateTypes.Navigation) as Ref<{ [language: string]: NavItem[] }>

  useState(StateTypes.CurrentNav) as Ref<DocusCurrentNav>

  const docusCurrentPath = useState(StateTypes.CurrentPath) as Ref<string>

  // @ts-ignore
  _contentLocalePath = context.$contentLocalePath

  // Init currentPath
  docusCurrentPath.value = `/${_route.params.pathMatch}`

  // Map locales to nav
  app.i18n.locales.forEach((locale: any) => (docusNavigation.value[locale.code] = []))

  // Preview mode for navigation
  if (typeof window !== 'undefined') {
    window.onNuxtReady(($nuxt: NuxtApp) => $nuxt.$on('docus:content:preview', () => fetchNavigation(_locale)))
  }

  // Update content on update.
  if (process.client) {
    window.onNuxtReady(($nuxt: NuxtApp) => $nuxt.$on('content:update', () => fetchNavigation(_locale)))
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
    getPageTemplate,
    fetchNavigation,
    isLinkActive,
    get,
    getPreviousAndNextLink
  }
}

/**
 * Access the navigation state.
 */
export const useNavigationState = () => useState(StateTypes.Navigation)

/**
 * Access the current navigation.
 */
export const useCurrentNav = () => useState(StateTypes.CurrentNav)

/**
 * Access the current path.
 */
export const useCurrentPath = () => useState(StateTypes.CurrentPath)

export type DocusNavigation = ReturnType<typeof useNavigation>
