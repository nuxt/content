import { createDatabaseAdapter } from '../internal/database-adapter'
import { getBetter3DatabaseAdapter } from '../internal/sqlite'

export default createDatabaseAdapter<{ filename: string }>((opts) => {
  return getBetter3DatabaseAdapter(opts)
})
