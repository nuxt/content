import { pascalCase } from 'scule'
import { pick } from './utils'
import type { ContentNavigationItem, PageCollectionItemBase, CollectionQueryBuilder } from '@nuxt/content'

/**
 * Create NavItem array to be consumed from runtime plugin.
 */
export async function generateNavigationTree<T extends PageCollectionItemBase>(queryBuilder: CollectionQueryBuilder<T>, extraFields: Array<keyof T> = []) {
  // @ts-expect-error -- internal
  const params = queryBuilder.__params
  if (!params?.orderBy?.length) {
    queryBuilder = queryBuilder.order('stem', 'ASC')
  }

  const collecitonItems = await queryBuilder
    .orWhere(group => group
      .where('navigation', '<>', 'false')
      .where('navigation', 'IS NULL'),
    )
    .select('navigation', 'stem', 'path', 'title', 'meta', ...(extraFields || []))
    .all() as unknown as PageCollectionItemBase[]

  const { contents, configs } = collecitonItems.reduce((acc, c) => {
    if (String(c.stem).split('/').pop() === '.navigation') {
      c.title = c.title?.toLowerCase() === 'navigation' ? '' : c.title
      const key = c.path!.split('/').slice(0, -1).join('/') || '/'
      acc.configs[key] = {
        ...c,
        ...c.body,
      }
    }
    else {
      acc.contents.push(c)
    }
    return acc
  }, { configs: {}, contents: [] } as { configs: Record<string, PageCollectionItemBase>, contents: PageCollectionItemBase[] })

  // Navigation fields picker
  const pickConfigNavigationFields = (content: PageCollectionItemBase) => ({
    ...pick(['title', ...(extraFields as string[])])(content as unknown as Record<string, unknown>),
    ...content.meta as unknown as Record<string, unknown>,
    ...(isObject(content?.navigation) ? (content.navigation as Record<string, unknown>) : {}),
  })
  const pickNavigationFields = (content: PageCollectionItemBase) => ({
    ...pick(['title', ...(extraFields as string[])])(content as unknown as Record<string, unknown>),
    ...(isObject(content?.navigation) ? (content.navigation as Record<string, unknown>) : {}),
  })

  // Create navigation object
  const nav = contents
    .reduce((nav, content) => {
      // Resolve path and id parts
      const parts = content.path!.substring(1).split('/')
      const idParts = content.stem.split('/')

      // Check if node is `*:index.md`
      const isIndex = !!idParts[idParts.length - 1]?.match(/([1-9]\d*\.)?index/g)

      const getNavItem = (content: PageCollectionItemBase) => ({
        title: content.title,
        path: content.path,
        stem: content.stem,
        children: [],
        ...pickNavigationFields(content),
      } as ContentNavigationItem)

      // Create navigation item from content
      const navItem: ContentNavigationItem = getNavItem(content)

      // Push index
      if (isIndex) {
        // Grab index directory config
        const dirConfig = configs[navItem.path]

        // Drop item if current directory config has `navigation: false`
        if (typeof dirConfig?.navigation !== 'undefined' && dirConfig?.navigation === false) {
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
            pickConfigNavigationFields(dirConfig),
          )
        }
      }

      // First-level item, push it straight to nav
      if (parts.length === 1) {
        // Check for duplicate link
        const existed = nav.find(item => item.path === navItem.path && item.page === false)
        if (isIndex && existed) {
          Object.assign(existed, {
            page: undefined,
            children: [
              ...(navItem.children || []),
              ...(existed.children || []),
            ],
          })
        }
        else {
          nav.push(navItem)
        }

        return nav
      }

      // Find siblings of current item and push them to parent children key
      const siblings = parts.slice(0, -1).reduce((nodes: ContentNavigationItem[], part: string, i: number) => {
        // Part of current path
        const currentPathPart: string = '/' + parts.slice(0, i + 1).join('/')

        // Get current node _dir.yml config
        const conf = configs[currentPathPart]

        // Drop childrens if .navigation.yml has `navigation: false`
        if (typeof conf?.navigation !== 'undefined' && conf.navigation === false) {
          return []
        }

        // Find parent node
        let parent: ContentNavigationItem | undefined = nodes.find(n => n.path === currentPathPart)

        // Create dummy parent if not found
        if (!parent) {
          const navigationConfig = (conf ? pickConfigNavigationFields(conf) : {}) as ContentNavigationItem
          parent = {
            ...navigationConfig,
            title: navigationConfig.title || generateTitle(part),
            path: currentPathPart,
            stem: idParts.slice(0, i + 1).join('/'),
            children: [],
            page: false,
          }
          nodes.push(parent!)
        }

        return parent!.children!
      }, nav)

      // Check for duplicate link
      const existed = siblings.find(item => item.path === navItem.path && item.page === false)
      if (existed) {
        Object.assign(existed, {
          ...navItem,
          page: undefined,
          children: [
            ...(navItem.children || []),
            ...(existed.children || []),
          ],
        })
      }
      else {
        siblings.push(navItem)
      }

      return nav
    }, [] as ContentNavigationItem[])

  return sortAndClear(nav)
}

// const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Sort items by path and clear empty children keys.
 */
function sortAndClear(nav: ContentNavigationItem[]) {
  const sorted = nav// .sort((a, b) => collator.compare(a.stem!, b.stem!))

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

function isObject(obj: unknown) {
  return obj !== null && Object.prototype.toString.call(obj) === '[object Object]'
}

export const generateTitle = (path: string) => path.split(/[\s-]/g).map(pascalCase).join(' ')
