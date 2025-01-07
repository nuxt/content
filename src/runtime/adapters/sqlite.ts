import { createDatabaseAdapter } from '../internal/database-adapter'
import { getBetter3DatabaseAdapter } from '../internal/sqlite'
import { getBunSqliteDatabaseAdapter } from '../internal/bunsqlite'

export default createDatabaseAdapter<{ filename: string }>((opts) => {
  // NOTE: Not using the getDefaultSqliteAdapter function here because its not in the runtime directory.
  if (process.versions.bun) {
    return getBunSqliteDatabaseAdapter(opts)
  }
  return getBetter3DatabaseAdapter(opts)
})
