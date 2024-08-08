export interface DatabaseAdaptor {
  first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | undefined>
  all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]>
  exec<T>(sql: string): Promise<T>
}
type databaseAdaptor = <Options>(otps?: Options) => Promise<DatabaseAdaptor> | DatabaseAdaptor

export function createDatabaseAdaptor(adaptor: databaseAdaptor) {
  return adaptor
}
