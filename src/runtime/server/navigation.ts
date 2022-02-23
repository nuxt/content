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
      const isIndex = !!idParts[idParts.length - 1].match(/([1-9][0-9]*\.)?index.md/g)

      const getNavItem = (content: ParsedContentMeta) => {
        return {
          id: content.id,
          title: content.title,
          slug: content.slug,
          draft: content.draft,
          partial: content.partial,
          position: content.position,
          children: []
        }
      }

      const navItem: NavItem = getNavItem(content)

      // Push index
      if (isIndex) {
        const indexItem = getNavItem(content)
        navItem.children.push(indexItem)

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
      siblings.push(navItem)

      return nav
    }, [] as NavItem[])

  return sortAndClear(nav)
}

/**
 * Sort items by position and clear empty children keys.
 */
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
