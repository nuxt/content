import ArrayQuery from './Query'

export default function createArrayDatabase(_options = {}): DatabaseProvider {
  const database: any = {}

  const query = (path: any, params: any) => {
    const to = typeof path === 'string' ? path : ''

    const opts = (typeof path === 'object' ? path : params) || {}

    return new ArrayQuery<any>(to, { ...opts, db: Object.values(database) })
  }

  const getItem = (key: string) => database[key]

  const setItem = (key: string, document: any) => {
    database[key] = document
  }

  const removeItem = (key: string) => {
    delete database[key]
  }

  const clear = () => {
    for (const key in database) {
      removeItem(key)
    }
  }

  const search = (to: string, params: any): Promise<[]> => query(to, params).fetch() as Promise<[]>

  const serialize = () => Promise.resolve(JSON.stringify(database))

  const load = (data: any) => {
    clear()
    Object.assign(database, JSON.parse(data))
    return Promise.resolve()
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    query,
    search,
    serialize,
    load
  }
}
export const createDatabase = createArrayDatabase
