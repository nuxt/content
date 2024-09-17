export interface DatabaseAdapter {
  first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | null | undefined>
  all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]>
  exec(sql: string): Promise<void>
}
type databaseAdapter = <Options = unknown>(otps?: Options) => Promise<DatabaseAdapter> | DatabaseAdapter

export function createDatabaseAdapter(adapter: databaseAdapter) {
  return adapter
}
