import { IncomingMessage } from 'http'
import { pascalCase } from 'scule'
import { withoutTrailingSlash } from 'ufo'
import { Nuxt } from '@nuxt/kit'
import { NavItem } from '../../types'
import list from '../runtime/nitro/api/list'

export async function getContents() {
  if (typeof (globalThis as any).$fetch !== 'undefined') {
    return (globalThis as any).$fetch('/_docus/list')
  }
  const { items } = await list({ url: '' } as IncomingMessage)
  return items
}

/**
 * Find a link from a vue-router to path
 */
const findLink = (links: NavItem[], to: string) => links.find(link => link.to === to)

/**
 * Transform a page slug into natural language title
 */
const slugToTitle = (title: string) => title && title.replace(/-/g, ' ').split(' ').map(pascalCase).join(' ')

/**
 * Get navigation link for a page
 */
const getPageLink = (page: any): NavItem => {
  const id = page.id

  const slug = (page.slug || page.to).split('/').pop()
  const to = withoutTrailingSlash(page.to || `/${slug}`)

  const template =
    typeof page.template === 'string' ? { self: page.template, nested: `${page.template}-post` } : page.template

  const item: NavItem = {
    // addintional fields for search index
    id,
    draft: page.draft,
    language: page.language,
    slug: page.slug,

    to,
    page: (page.slug === '' && page.empty) || page.page,
    children: [],
    title: page.title || slugToTitle(to.split('/').pop() || ''),
    ...page.navigation
  }

  if (page.draft) {
    item.draft = true
  }

  if (page.icon) {
    item.icon = page.icon
  }

  if (template) {
    item.template = template.nested
  }

  // set `hidden = true` if navigation is disabled for the page
  if (page.navigation === false) {
    item.hidden = true
  }

  return item
}

/**
 * Fetch and update navigation with latest changes
 */
export async function generateNavigation(nuxt: Nuxt) {
  const defaultLocale = nuxt.options.i18n?.defaultLocale || 'en'

  // Query pages
  const contents = await getContents()

  const languages: { [key: string]: any[] } = contents.reduce((map: any, page: any) => {
    const language = page.language || defaultLocale
    map[language] = map[language] || []
    map[language].push(page)
    return map
  }, {} as any)

  const navigationArray = Object.entries(languages).map(([language, pages]) => {
    const body = createNav(pages)

    return [language, body]
  })

  const navigation = Object.fromEntries(navigationArray)

  await nuxt.callHook('docus:navigation', navigation)

  return navigation
}

/**
 * Create NavItem array to be consumed from runtime plugin.
 */
function createNav(pages: any[]) {
  const links: NavItem[] = []

  // Add each page to navigation
  pages.forEach((_page: any) => {
    const $page = getPageLink(_page)

    if ($page.slug.startsWith('_')) {
      return
    }

    // To: '/docs/guide/hello.md' -> dirs: ['docs', 'guide']
    const dirs = $page.to.split('/').filter(_ => _)

    // handle index file
    if (!dirs.length) {
      return links.push($page)
    }

    // handle top level contents
    if (dirs.length === 1 && _page.slug) {
      return links.push($page)
    }

    let currentLinks = links
    let lastLink: NavItem | undefined

    dirs.forEach((dir: string, index: number) => {
      const to = '/' + dirs.slice(0, index + 1).join('/')

      // If children has been disabled (nav.children = false)
      if (!currentLinks) return

      let link: NavItem | undefined = findLink(currentLinks, to)

      if (!link) {
        link = getPageLink({
          slug: dir,
          to,
          page: false
        })

        currentLinks.push(link)
      }
      currentLinks = link.children
      lastLink = link
    })

    if (!currentLinks) return

    // If index page, merge also with parent for metadata
    if (!_page.slug) {
      if (dirs.length === 1) {
        $page.exclusive = $page.exclusive || false
      }

      mergeLinks(lastLink!, $page)
    } else {
      // Push page
      currentLinks.push($page)
    }
  })

  return links
}

function mergeLinks(to: NavItem, from: NavItem) {
  Object.assign(to, from, {
    children: [...to.children, ...from.children]
  })
}
