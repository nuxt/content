import { joinURL } from 'ufo'
import { BaseQueryBuiler, NavItem } from '@docus/core/runtime'

type Content = {
  search: (to: string, params?: any) => BaseQueryBuiler<any>
  get: (key: string) => Promise<any>
}

export const useDocusApi = ($content: Content) => {
  const data = (path: string) => $content.get(joinURL('/data', path))

  const search = (to: string, params?: any) => $content.search(to, params)

  const page = (path: string) => $content.get(path)

  const findLink = (links: NavItem[], to: string) => links.find(link => link.to === to)

  return {
    data,
    search,
    page,
    findLink
  }
}
