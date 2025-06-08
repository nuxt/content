import type { ContentNavigationItem } from '../../types'

type FindPageBreadcrumbOptions = { current?: boolean, indexAsChild?: boolean }

export function findPageBreadcrumb(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: FindPageBreadcrumbOptions): ContentNavigationItem[] {
  if (!navigation?.length || !path) {
    return []
  }

  return navigation.reduce((breadcrumb: ContentNavigationItem[], link: ContentNavigationItem) => {
    if (path && (path + '/').startsWith(link.path + '/')) {
      if (path !== link.path || options?.current || (options?.indexAsChild && link.children)) {
        breadcrumb.push(link)
      }
      if (link.children) {
        breadcrumb.push(...findPageBreadcrumb(link.children.filter(c => c.path !== link.path || (c.path === path && options?.current && options?.indexAsChild)), path, options))
      }
    }
    return breadcrumb
  }, [])
}

type FindPageChildrenOptions = { indexAsChild?: boolean }

export function findPageChildren(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: FindPageChildrenOptions): ContentNavigationItem[] {
  if (!navigation?.length || !path) {
    return []
  }

  return navigation.reduce((children: ContentNavigationItem[], link: ContentNavigationItem) => {
    if (link.children) {
      if (path === link.path) {
        return link.children.filter(c => c.path !== path || options?.indexAsChild)
      }
      else if ((path + '/').startsWith(link.path + '/')) {
        return findPageChildren(link.children, path, options)
      }
    }

    return children
  }, [])
}

export function findPageSiblings(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: FindPageChildrenOptions): ContentNavigationItem[] {
  if (!navigation?.length || !path) {
    return []
  }

  const parentPath = path.substring(0, path.lastIndexOf('/'))

  return findPageChildren(navigation, parentPath, options).filter(c => c.path !== path)
}
