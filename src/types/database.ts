export type DatabaseBindParams = Array<DatabaseBindable>

export type DatabaseBindable = number | string | boolean | null | undefined

export interface DatabaseAdapter {
  first<T>(sql: string, params?: DatabaseBindParams): Promise<T | null | undefined>
  all<T>(sql: string, params?: DatabaseBindParams): Promise<T[]>
  exec(sql: string): Promise<void>
}

export type DatabaseAdapterFactory<Options> = (otps?: Options) => DatabaseAdapter
