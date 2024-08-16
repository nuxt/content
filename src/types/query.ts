export type SQLOperator = '=' | '>' | '<' | '<>' | 'in' | 'BETWEEN' | 'NOT BETWEEN' | 'IS NULL' | 'IS NOT NULL' | 'LIKE' | 'NOT LIKE'

export interface CollectionQueryBuilder<T> {
  path(path: string): CollectionQueryBuilder<T>
  where(field: string, operator: SQLOperator, value: unknown): CollectionQueryBuilder<T>
  select<K extends keyof T>(...fields: K[]): CollectionQueryBuilder<Pick<T, K>>
  order(field: keyof T, direction: 'ASC' | 'DESC'): CollectionQueryBuilder<T>
  skip(skip: number): CollectionQueryBuilder<T>
  limit(limit: number): CollectionQueryBuilder<T>
  all(): Promise<T[]>
  first(): Promise<T>
}
