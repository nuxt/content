export type SQLOperator = '=' | '>=' | '<=' | '>' | '<' | '<>' | 'IN' | 'BETWEEN' | 'NOT BETWEEN' | 'IS NULL' | 'IS NOT NULL' | 'LIKE' | 'NOT LIKE'

export type QueryGroupFunction<T> = (group: CollectionQueryGroup<T>) => CollectionQueryGroup<T>

export interface CollectionQueryBuilder<T> {
  path(path: string): CollectionQueryBuilder<T>
  select<K extends keyof T>(...fields: K[]): CollectionQueryBuilder<Pick<T, K>>
  order(field: keyof T, direction: 'ASC' | 'DESC'): CollectionQueryBuilder<T>
  skip(skip: number): CollectionQueryBuilder<T>
  limit(limit: number): CollectionQueryBuilder<T>
  all(): Promise<T[]>
  first(): Promise<T | null>
  count(field?: keyof T | '*', distinct?: boolean): Promise<number>
  where(field: string, operator: SQLOperator, value?: unknown): CollectionQueryBuilder<T>
  andWhere(groupFactory: QueryGroupFunction<T>): CollectionQueryBuilder<T>
  orWhere(groupFactory: QueryGroupFunction<T>): CollectionQueryBuilder<T>
}

export interface CollectionQueryGroup<T> {
  where(field: string, operator: SQLOperator, value?: unknown): CollectionQueryGroup<T>
  andWhere(groupFactory: QueryGroupFunction<T>): CollectionQueryGroup<T>
  orWhere(groupFactory: QueryGroupFunction<T>): CollectionQueryGroup<T>
}
