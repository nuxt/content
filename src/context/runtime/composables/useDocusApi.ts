import type { NavItem } from '@docus/core/runtime'
import { PermissiveContext } from '../../../types'

export const useDocusApi = (context: PermissiveContext) => {
  const data = (path: string) => context.$content.fetch(path)

  const search = (to: string, params?: any) => context.$content.search(to, params)

  const page = (path: string) => context.$content.get(path)

  const findLink = (links: NavItem[], to: string) => links.find(link => link.to === to)

  return {
    data,
    search,
    page,
    findLink
  }
}
