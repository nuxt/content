export type SQLOperator = '=' | '>' | '<' | '<>' | 'in' | 'BETWEEN' | 'NOT BETWEEN' | 'IS NULL' | 'IS NOT NULL' | 'LIKE' | 'NOT LIKE'

export interface ContentQueryBuilder<T> {
  path(path: string): ContentQueryBuilder<T>
  where(field: string, operator: SQLOperator, value: unknown): ContentQueryBuilder<T>
  select<K extends keyof T>(...fields: K[]): ContentQueryBuilder<Pick<T, K>>
  order(field: keyof T, direction: 'ASC' | 'DESC'): ContentQueryBuilder<T>
  skip(skip: number): ContentQueryBuilder<T>
  limit(limit: number): ContentQueryBuilder<T>
  all(): Promise<T[]>
  first(): Promise<T>
}
