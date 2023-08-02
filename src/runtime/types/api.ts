export interface ContentQueryFindResponse<T> {
  result: Array<T>
  skip: number
  limit: number
  total: number
}

export interface ContentQueryFindOneResponse<T> {
  result: T | undefined
}

export interface ContentQueryCountResponse {
  result: number
}

export type ContentQueryResponse<T> = ContentQueryFindResponse<T> | ContentQueryFindOneResponse<T> | ContentQueryCountResponse

export interface ContentQueryWithSurround<T> {
  surround: Array<T | null>
}

export interface ContentQueryWithDirConfig {
  dirConfig: Record<string, any>
}
