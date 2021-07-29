import { IncomingMessage } from 'http'
import { pascalCase } from 'scule'
import { withoutTrailingSlash } from 'ufo'
import { Nuxt } from '@nuxt/kit'
import defu from 'defu'
import { NavItem } from '../types'
import list from '../server/api/list'
import { pick } from '../runtime/utils/object'
import { useDocusContext } from '../context'
import { generatePosition } from '../transformers/utils'

/**
 * Determine whether it is the index file or not
 *
 * @param path relative to full path of the file
 * @returns
 */
const isIndex = (path: string) => path.endsWith('index.md')

/**
 * Sort keys and put index files at first
 *
 * @param keys array of files
 * @returns
 */
function sortItems(keys: any[]) {
  return [...keys].sort((a, b) => {
    const isA = isIndex(a.id)
    const isB = isIndex(b.id)
    if (isA && isB) return a.id.length - b.id.length
    if (isB) return 1
    if (isA) return -1
    return 0
  })
}

export async function getContents() {
  let items
  // Nitro API
  if (typeof (globalThis as any).$fetch !== 'undefined') {
    items = (globalThis as any).$fetch('/_docus/list/content')
  } else {
    const result = await list({ url: '/content' } as IncomingMessage)
    items = result.items
  }
  return sortItems(items)
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
  const {
    search: { fields, inheritanceFields }
  } = useDocusContext()!
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
    page: !(page.slug === '' && page.empty) && page.page,
    children: [],
    title: page.title || slugToTitle(to.split('/').pop() || ''),
    ...page.navigation,
    ...pick(inheritanceFields)(page),
    ...pick(fields)(page)
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
 * Sort links based on id/position map.
 **/
function sortWithPosition(links: NavItem[], map: { [key: string]: string }) {
  links.forEach(link => sortWithPosition(link.children || [], map))
  const pos = (a: NavItem) => map[a.id] || /* largest position */ '999999999999'
  return links.sort((a, b) => pos(a).localeCompare(pos(b)))
}

/**
 * Create NavItem array to be consumed from runtime plugin.
 */
function createNav(pages: any[]) {
  const {
    search: { inheritanceFields }
  } = useDocusContext()!
  const pickInheritanceFields = pick(inheritanceFields)

  const links: NavItem[] = []
  const sortMap: { [key: string]: string } = {}

  // Add each page to navigation
  pages.forEach((_page: any) => {
    sortMap[_page.id] = String(_page.position)
    const $page = getPageLink(_page)

    if ($page.slug.startsWith('_')) {
      return
    }

    // To: '/docs/guide/hello.md' -> dirs: ['docs', 'guide', 'hello']
    const dirs = $page.to.split('/').filter(_ => _)
    const idParts = $page.id.split(/[:/]/)

    // handle index file
    if (!dirs.length) {
      return links.push($page)
    }

    let currentLinks = links
    let lastLink: NavItem | undefined
    const parents: any[] = []

    // find root content if it exists
    const root = findLink(currentLinks, '/')
    if (root) parents.push(root)

    dirs.forEach((dir: string, index: number) => {
      const to = '/' + dirs.slice(0, index + 1).join('/')

      // If children has been disabled (nav.children = false)
      if (!currentLinks) return

      let link: NavItem | undefined = findLink(currentLinks, to)

      if (!link) {
        link = getPageLink({
          id: idParts.slice(0, index + 2).join(':'),
          slug: dir,
          to,
          page: false
        })
        // generate position for new link
        sortMap[link.id] = generatePosition(idParts.slice(1, index + 2).join(':'))

        currentLinks.push(link)
      }
      currentLinks = link.children
      lastLink = link
      parents.unshift(link)
    })

    // Inherit keys from parent
    Object.assign($page, defu(pickInheritanceFields($page), ...parents.map(pickInheritanceFields)))

    if (!currentLinks) return

    // If index page, merge also with parent for metadata
    if (lastLink?.to === $page.to) {
      mergeLinks(lastLink!, $page)
    } else {
      // Push page
      currentLinks.push($page)
    }
  })

  return sortWithPosition(links, sortMap)
}

function mergeLinks(to: NavItem, from: NavItem) {
  Object.assign(to, from, {
    children: [...to.children, ...from.children]
  })
}
