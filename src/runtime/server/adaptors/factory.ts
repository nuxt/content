export interface DatabaseAdaptor {
  first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | null | undefined>
  all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]>
  exec(sql: string): Promise<void>
}
type databaseAdaptor = <Options = unknown>(otps?: Options) => Promise<DatabaseAdaptor> | DatabaseAdaptor

export function createDatabaseAdaptor(adaptor: databaseAdaptor) {
  return adaptor
}
