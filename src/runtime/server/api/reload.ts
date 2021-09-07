import { clearDatabase } from '../../database'

/**
 * Reload the database.
 */
export default () => {
  clearDatabase()

  return true
}
