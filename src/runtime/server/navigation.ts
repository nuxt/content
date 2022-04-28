import { NavItem, ParsedContentMeta } from '../types'
import { generateTitle } from './transformers/path-meta'
import { useRuntimeConfig } from '#imports'

type PrivateNavItem = NavItem & { path?: string }
/**
 * Create NavItem array to be consumed from runtime plugin.
 */
export function createNav (contents: ParsedContentMeta[], configs: Record<string, ParsedContentMeta>) {
  const { navigation } = useRuntimeConfig().content
  const pickNavigationFields = pick(['title', ...navigation.fields])
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
          path: content.path,
          children: [],
          ...pickNavigationFields(content),
          ...(content.draft ? { draft: true } : {})
        }
      }

      const navItem: PrivateNavItem = getNavItem(content)

      // Push index
      if (isIndex) {
        const indexItem = getNavItem(content)
        navItem.children.push(indexItem)

        const conf = configs[indexItem.path.split('/').slice(0, -1).join('/')]
        Object.assign(indexItem, pickNavigationFields(conf))

        // Set parent as directory
        delete navItem.id
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
          const conf = configs[idParts.slice(0, i + 1).join('/')]
          parent = {
            slug: currentPathSlug,
            title: generateTitle(part),
            path: idParts.slice(0, i + 1).join('/'),
            children: [],
            ...pickNavigationFields(conf)
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

/**
 * Returns a new object with the specified keys
 **/
function pick (keys?: string[]) {
  return (obj: any = {}) => {
    if (keys && keys.length) {
      return keys
        .filter(key => typeof obj[key] !== 'undefined')
        .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
    }
    return obj
  }
}
