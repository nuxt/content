import type { ContentNavigationItem, PageDocument } from '~/src/types'

/**
 * Create NavItem array to be consumed from runtime plugin.
 */
export function generateNavigationTree(contents: PageDocument[], configs: Record<string, PageDocument>, extraFields: string[] = []) {
  // Navigation fields picker
  const pickNavigationFields = (content: PageDocument) => ({
    ...pick(['title', ...extraFields])(content),
    ...(isObject(content?.navigation) ? (content.navigation as Record<string, unknown>) : {}),
  })

  // Create navigation object
  const nav = contents
    .reduce((nav, content) => {
      // Resolve path and id parts
      const parts = content.path!.substring(1).split('/')
      const idParts = content.stem.split(':').slice(1)

      // Check if node is `*:index.md`
      const isIndex = !!idParts[idParts.length - 1]?.match(/([1-9]\d*\.)?index/g)

      const getNavItem = (content: PageDocument) => ({
        title: content.title,
        path: content.path,
        stem: content.stem,
        children: [],
        ...pickNavigationFields(content),
      })

      // Create navigation item from ParsedContent
      const navItem: ContentNavigationItem = getNavItem(content)

      // Push index
      if (isIndex) {
        // Grab index directory config
        const dirConfig = configs[navItem.path]

        // Drop item if current directory config has `navigation: false`
        if (typeof dirConfig?.navigation !== 'undefined' && !dirConfig?.navigation) {
          return nav
        }

        // Skip root `index.md` as it has to be pushed as a page
        if (content.path !== '/') {
          const indexItem = getNavItem(content)
          navItem.children!.push(indexItem)
        }

        if (dirConfig) {
          // Merge navigation fields with navItem
          Object.assign(
            navItem,
            pickNavigationFields(dirConfig),
          )
        }
      }

      // First-level item, push it straight to nav
      if (parts.length === 1) {
        nav.push(navItem)
        return nav
      }

      // Find siblings of current item and push them to parent children key
      const siblings = parts.slice(0, -1).reduce((nodes, part, i) => {
        // Part of current path
        const currentPathPart: string = '/' + parts.slice(0, i + 1).join('/')

        // Get current node _dir.yml config
        const conf = configs[currentPathPart]

        // Drop childrens if _dir.yml has `navigation: false`
        if (typeof conf?.navigation !== 'undefined' && !conf.navigation) {
          return []
        }

        // Find parent node
        let parent: ContentNavigationItem | undefined = nodes.find(n => n.path === currentPathPart)

        // Create dummy parent if not found
        if (!parent) {
          parent = {
            title: part,
            path: currentPathPart,
            stem: idParts.join(':'),
            children: [],
            page: false,
            ...(conf && pickNavigationFields(conf)),
          }
          nodes.push(parent!)
        }

        return parent!.children!
      }, nav)

      siblings.push(navItem)

      return nav
    }, [] as ContentNavigationItem[])

  return sortAndClear(nav)
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Sort items by path and clear empty children keys.
 */
function sortAndClear(nav: ContentNavigationItem[]) {
  const sorted = nav.sort((a, b) => collator.compare(a.stem, b.stem))

  for (const item of sorted) {
    if (item.children?.length) {
      // Sort children
      sortAndClear(item.children)
    }
    else {
      // Remove empty children
      delete item.children
    }
    // Remove path after sort
    // delete item.stem
  }

  return nav
}

/**
 * Returns a new object with the specified keys
 */
function pick(keys?: string[]) {
  return (obj: Record<string, unknown>) => {
    obj = obj || {}
    if (keys && keys.length) {
      return keys
        .filter(key => typeof obj[key] !== 'undefined')
        .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
    }
    return obj
  }
}

function isObject(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
