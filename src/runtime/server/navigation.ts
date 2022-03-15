import { NavItem, ParsedContentMeta } from '../types'
import { generateTitle } from './transformer/plugin-path-meta'

type PrivateNavItem = NavItem & { path?: string }
/**
 * Create NavItem array to be consumed from runtime plugin.
 */
export function createNav (contents: ParsedContentMeta[]) {
  const nav = contents
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .reduce((nav, content) => {
      const parts = content.slug.substring(1).split('/')
      const idParts = content.id.split(':').slice(1)
      const isIndex = !!idParts[idParts.length - 1].match(/([1-9][0-9]*\.)?index.md/g)

      const getNavItem = (content: ParsedContentMeta) => {
        return {
          id: content.id,
          title: content.title,
          slug: content.slug,
          draft: content.draft,
          partial: content.partial,
          path: content.path,
          children: []
        }
      }

      const navItem: PrivateNavItem = getNavItem(content)

      // Push index
      if (isIndex) {
        const indexItem = getNavItem(content)
        navItem.children.push(indexItem)

        // Check for "parent" key on index
        if (content.parent) {
          // Check for "title" key on index
          if (content.parent.title && typeof content.parent.title === 'string') { navItem.title = content.parent.title }
        }

        // Set parent as directory
        delete navItem.draft
        delete navItem.partial
      }

      // First-level item, push it straight to nav
      if (parts.length === 1) {
        nav.push(navItem)
        return nav
      }

      // Find siblings of current item and push them to parent children key
      const siblings = parts.slice(0, -1).reduce((nodes, part, i) => {
        // Slug of current path
        const currentPathSlug = '/' + parts.slice(0, i + 1).join('/')

        // Find parent node
        let parent: PrivateNavItem = nodes.find(n => n.slug === currentPathSlug)

        // Create dummy parent if not found
        if (!parent) {
          parent = {
            slug: currentPathSlug,
            title: generateTitle(part),
            path: idParts.slice(0, i + 1).join(':'),
            children: []
          }
          nodes.push(parent)
        }

        return parent.children
      }, nav)
      siblings.push(navItem)

      return nav
    }, [] as PrivateNavItem[])

  return sortAndClear(nav)
}

/**
 * Sort items by path and clear empty children keys.
 */
function sortAndClear (nav: PrivateNavItem[]) {
  const sorted = nav.sort((a, b) => a.path.localeCompare(b.path))

  for (const item of sorted) {
    if (item.children.length) {
      // Sort children
      sortAndClear(item.children)
    } else {
      // Remove empty children
      delete item.children
    }
    // Remove path after sort
    delete item.path
  }

  return nav
}
