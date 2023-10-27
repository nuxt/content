import type { NavItem, ParsedContentMeta } from '../types'
import { generateTitle } from '../transformers/path-meta'
import { useRuntimeConfig } from '#imports'

type PrivateNavItem = NavItem & { path?: string }

/**
 * Create NavItem array to be consumed from runtime plugin.
 */
export function createNav (contents: ParsedContentMeta[], configs: Record<string, ParsedContentMeta>) {
  // Get navigation config from runtimeConfig
  const { navigation } = useRuntimeConfig().public.content

  // Navigation fields picker
  const pickNavigationFields = (content: ParsedContentMeta) => ({
    ...pick(['title', ...navigation.fields])(content),
    ...(isObject(content?.navigation) ? content.navigation : {})
  })

  // Create navigation object
  const nav = contents
    .sort((a, b) => a._path!.localeCompare(b._path!))
    .reduce((nav, content) => {
      // Resolve path and id parts
      const parts = content._path!.substring(1).split('/')
      const idParts = content._id.split(':').slice(1)

      // Check if node is `*:index.md`
      const isIndex = !!idParts[idParts.length - 1].match(/([1-9][0-9]*\.)?index.md/g)

      const getNavItem = (content: ParsedContentMeta) => ({
        title: content.title,
        _path: content._path,
        _file: content._file,
        children: [],
        ...pickNavigationFields(content),
        ...(content._draft ? { _draft: true } : {})
      })

      // Create navigation item from ParsedContent
      const navItem: PrivateNavItem = getNavItem(content)

      // Push index
      if (isIndex) {
        // Grab index directory config
        const dirConfig = configs[navItem._path]

        // Drop item if current directory config has `navigation: false`
        if (typeof dirConfig?.navigation !== 'undefined' && !dirConfig?.navigation) {
          return nav
        }

        // Skip root `index.md` as it has to be pushed as a page
        if (content._path !== '/') {
          const indexItem = getNavItem(content)
          navItem.children!.push(indexItem)
        }

        // Merge navigation fields with navItem
        Object.assign(
          navItem,
          pickNavigationFields(dirConfig)
        )
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
        let parent: PrivateNavItem | undefined = nodes.find(n => n._path === currentPathPart)

        // Create dummy parent if not found
        if (!parent) {
          parent = {
            title: generateTitle(part),
            _path: currentPathPart,
            _file: content._file,
            children: [],
            ...pickNavigationFields(conf)
          }
          nodes.push(parent!)
        }

        return parent!.children!
      }, nav)

      siblings.push(navItem)

      return nav
    }, [] as PrivateNavItem[])

  return sortAndClear(nav)
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Sort items by path and clear empty children keys.
 */
function sortAndClear (nav: PrivateNavItem[]) {
  const sorted = nav.sort((a, b) => collator.compare(a._file, b._file))

  for (const item of sorted) {
    if (item.children?.length) {
      // Sort children
      sortAndClear(item.children)
    } else {
      // Remove empty children
      delete item.children
    }
    // Remove path after sort
    delete item._file
  }

  return nav
}

/**
 * Returns a new object with the specified keys
 **/
function pick (keys?: string[]) {
  return (obj: any) => {
    obj = obj || {}
    if (keys && keys.length) {
      return keys
        .filter(key => typeof obj[key] !== 'undefined')
        .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
    }
    return obj
  }
}

function isObject (obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
