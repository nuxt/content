import { omit } from '../utils/object'
import { useDocusContext } from '../context'
import createLocalDatabase from './providers/local'
import type { DatabaseProvider } from 'types'

/**
 * Create the database out of the choosen provider
 */
export async function createDatabase(navigation: any) {
  const {
    database: { provider, options }
  } = useDocusContext()!
  let db

  switch (provider) {
    case 'local':
    default:
      db = createLocalDatabase(options)
  }

  // initialize the database using given navigation
  await initializeDatabase(db, navigation)

  return db
}

/**
 * Initialize the database
 */
function initializeDatabase(db: DatabaseProvider, navigation: any) {
  function index(item: any) {
    // insert pages and non-page document to navigation object for search purpose
    db?.setItem(item.id, omit(['children'])(item))

    if (item.children) {
      item.children.forEach(index)
    }
  }

  Object.values(navigation || {})
    .flatMap(i => i)
    .forEach(index)
}
