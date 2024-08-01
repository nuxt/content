interface DatabaseAdaptor {
  first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T>
  all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]>
  exec<T>(sql: string): Promise<T>
}
type databaseAdaptor = <Options>(otps?: Options) => DatabaseAdaptor

export function createDatabaseAdaptor(adaptor: databaseAdaptor) {
  return adaptor
}
