export type SQLOperator = '=' | '>' | '<' | '<>' | 'in' | 'BETWEEN' | 'NOT BETWEEN' | 'IS NULL' | 'IS NOT NULL' | 'LIKE' | 'NOT LIKE'

export interface ContentQueryBuilder<T> {
  path(path: string): ContentQueryBuilder<T>
  skip(skip: number): ContentQueryBuilder<T>
  where(field: string, operator: SQLOperator, value: unknown): ContentQueryBuilder<T>
  select<K extends keyof T>(...fields: K[]): ContentQueryBuilder<Pick<T, K>>
  limit(limit: number): ContentQueryBuilder<T>
  all(): Promise<T[]>
  first(): Promise<T>
}
