import { createContext } from 'unctx'
import { DatabaseProvider } from '../../types'

const ctx = createContext()

export const setDatabaseProvider = (provider: DatabaseProvider) => ctx.set(provider, true)

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
