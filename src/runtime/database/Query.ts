import { QueryBuilder, QueryBuilderParams } from '../../types/Database'

/**
 * Abstract query builder class, to be implemented by any provider.
 */
export abstract class BaseQueryBuiler<T> implements QueryBuilder<T> {
  protected params: QueryBuilderParams = {
    skip: 0,
    limit: 0,
    only: [],
    without: [],
    sortBy: [],
    where: {}
  }

  only(keys: string | string[]) {
    this.params.only = Array.isArray(keys) ? keys : [keys]
    // Return current instance
    return this
  }

  without(keys: string | string[]) {
    this.params.without = Array.isArray(keys) ? keys : [keys]
    // Return current instance
    return this
  }

  sortBy(field: string, direction: 'asc' | 'desc') {
    this.params.sortBy.push([field, direction])
    return this
  }

  where(query: any) {
    this.params.where = query
    return this
  }

  surround(slugOrTo: string, options: { before: number; after: number }) {
    this.params.surround = {
      slugOrTo,
      options
    }
    return this
  }

  limit(count: number | string) {
    if (typeof count === 'string') {
      count = parseInt(count)
    }

    this.params.limit = count
    return this
  }

  skip(count: number | string) {
    if (typeof count === 'string') {
      count = parseInt(count)
    }

    this.params.skip = count
    return this
  }

  abstract fetch(params?: any): Promise<T | T[]>
}
