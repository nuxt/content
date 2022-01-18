import { createQuery } from './query'

export function createDatabase<T = any>(_options = {}): DatabaseProvider<T> {
  const database: Record<string, T> = {}

  const query = (path: any, params: Partial<QueryBuilderParams>) => {
    const to = typeof path === 'string' ? path : ''

    const opts = (typeof path === 'object' ? path : params) || {}

    return createQuery(Object.values(database), { ...opts, to })
  }

  const clear = () => {
    for (const key in database) delete database[key]
  }

  const load = (data: any) => {
    clear()
    Object.assign(database, JSON.parse(data))
    return Promise.resolve()
  }

  return {
    getItem: (key: string) => database[key],
    setItem: (key: string, document: any) => (database[key] = document),
    removeItem: (key: string) => delete database[key],
    search: (to, params) => query(to, params).fetch(),
    serialize: () => Promise.resolve(JSON.stringify(database)),
    load,
    clear,
    query
  }
}
