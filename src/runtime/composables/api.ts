import { joinURL } from 'ufo'
import { NavItem } from '../../../types'
import { BaseQueryBuiler } from '../database/Query'

type Content = {
  search: (to: string, params?: any) => BaseQueryBuiler<any>
  get: (key: string) => Promise<any>
}

export const useDocusApi = ($content: Content) => {
  const data = (path: string) => $content.get(joinURL('/data', path))

  const search = (to: string, params?: any) => $content.search(joinURL(to, params))

  const page = (path: string) => $content.get(path)

  const findLink = (links: NavItem[], to: string) => links.find(link => link.to === to)

  return {
    data,
    search,
    page,
    findLink
  }
}
