import { NavItem, ParsedContentMeta } from '../types'
import { generatePosition, generateTitle } from './transformer/plugin-path-meta'

/**
 * Create NavItem array to be consumed from runtime plugin.
 */
export function createNav (contents: ParsedContentMeta[]) {
  const nav = contents
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .reduce((nav, content) => {
      const parts = content.slug.substring(1).split('/')
      const idParts = content.id.split(':').slice(1)
      const navItem: NavItem = {
        id: content.id,
        title: content.title,
        slug: content.slug,
        draft: content.draft,
        partial: content.partial,
        position: content.position,
        children: []
      }

      if (parts.length === 1) {
        nav.push(navItem)
        return nav
      }

      const sibligns = parts.slice(0, -1).reduce((nodes, part, i) => {
        // Slug of current path
        const currentPathSlug = '/' + parts.slice(0, i + 1).join('/')
        // Find parent node
        let parent = nodes.find(n => n.slug === currentPathSlug)

        // Create dummy parent if not found
        if (!parent) {
          parent = {
            slug: currentPathSlug,
            title: generateTitle(part),
            position: generatePosition(idParts.slice(0, i + 1).join(':')),
            children: []
          }
          nodes.push(parent)
        }

        return parent.children
      }, nav)
      sibligns.push(navItem)

      return nav
    }, [] as NavItem[])

  return sortAndClear(nav)
}

function sortAndClear (nav: NavItem[]) {
  const sorted = nav.sort((a, b) => a.position.localeCompare(b.position))
  for (const item of sorted) {
    if (item.children.length) {
      // Sort children
      sortAndClear(item.children)
    } else {
      // Remove empty children
      delete item.children
    }
    // Remove position after sort
    delete item.position
  }
  return nav
}
