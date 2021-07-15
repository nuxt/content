import { createContext } from 'unctx'
import { BaseQueryBuiler } from './Query'

export interface SearchOptions {
  sortBy: string[]
  skip: number
  limit: number
  only: string[] | string
  without: string[] | string
  where: any
  surround: string[]
  deep: boolean
  text: boolean
}
export interface DatabaseProvider {
  getItem<T>(key: string): T
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
  //
  search<T>(query: string, params: any): Promise<T[]>
  query<T>(query: string, params: any): BaseQueryBuiler<T>
  //
  serialize(): Promise<any>
  load(serialized: any): Promise<void>
}

const ctx = createContext()

export const setDatabaseProvide = (provider: DatabaseProvider) => ctx.set(provider, true)

export function useDB() {
  const provider = ctx.use()
  return {
    getItem: provider.getItem,
    setItem: provider.setItem,
    removeItem: provider.removeItem,
    clear: provider.clear,
    search: provider.search,
    query: provider.query,
    serialize: provider.serialize,
    load: provider.load
  }
}
