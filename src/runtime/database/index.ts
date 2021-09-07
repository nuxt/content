import { createContext } from 'unctx'
import { omit } from '../utils/object'
import { DatabaseProvider } from '../../types'
import { useDocusContext } from '../context'
import { generateNavigation } from '../navigation'
import createLokijsDatabase from './providers/lokijs'

const ctx = createContext<DatabaseProvider>()

export const setDatabase = ctx.set

export const clearDatabase = ctx.unset

/**
 * Gives a DatabaseProvider instance.
 */
export async function useDB(): Promise<DatabaseProvider> {
  const docusContext = useDocusContext()!
  let provider = ctx.use()

  if (!provider) {
    provider = createDatabase(docusContext.database.provider, docusContext.database.options)
    await initializeDatabase(provider)
    ctx.set(provider, true)
  }

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

/**
 * Initialize the database
 */
async function initializeDatabase(db: DatabaseProvider) {
  const navigation = await generateNavigation()

  function index(item: any) {
    // insert pages an non-page document to navigation object for search purpose
    db?.setItem(item.id, omit(['children'])(item))

    if (item.children) {
      item.children.forEach(index)
    }
  }

  Object.values(navigation || {})
    .flatMap(i => i)
    .forEach(index)
}

/**
 * Create the database out of the chosen provider (by default: LokiJS)
 */
function createDatabase(provider: string, options: any): DatabaseProvider {
  switch (provider) {
    default:
      return createLokijsDatabase(options)
  }
}
