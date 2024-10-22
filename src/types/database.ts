export interface DatabaseAdapter {
  first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | null | undefined>
  all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]>
  exec(sql: string): Promise<void>
}

export type DatabaseAdapterFactory<Options> = (otps?: Options) => DatabaseAdapter
