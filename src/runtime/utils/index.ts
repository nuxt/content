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

type FindPageOptions = { indexAsChild?: boolean }

export function findPageChildren(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: FindPageOptions): ContentNavigationItem[] {
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

export function findPageSiblings(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: FindPageOptions): ContentNavigationItem[] {
  if (!navigation?.length || !path) {
    return []
  }

  const parentPath = path.substring(0, path.lastIndexOf('/'))

  return findPageChildren(navigation, parentPath, options).filter(c => c.path !== path)
}

export function findPageHeadline(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: FindPageOptions): string | undefined {
  if (!navigation?.length || !path) {
    return
  }

  for (const link of navigation) {
    if (options?.indexAsChild) {
      if (link.children) {
        const headline = findPageHeadline(link.children, path, options)
        if (headline) {
          return headline
        }
        for (const child of link.children) {
          if (child.path === path) {
            return link.title
          }
        }
      }
    }
    else {
      if (link.children) {
        for (const child of link.children) {
          const isIndex = child.stem?.endsWith('/index')
          if (child.path === path && !isIndex) {
            return link.title
          }
        }
        const headline = findPageHeadline(link.children, path, options)
        if (headline) {
          return headline
        }
      }
    }
  }
}
