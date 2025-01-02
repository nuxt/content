import { createDatabaseAdapter } from '../internal/database-adapter'
import { getBunSqliteDatabaseAdapter } from '../internal/bunsqlite'

export default createDatabaseAdapter<{ filename: string }>((opts) => {
  return getBunSqliteDatabaseAdapter(opts)
})
