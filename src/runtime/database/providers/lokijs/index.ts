import lokidb from '@lokidb/loki'
import { DatabaseProvider } from '../../../../types'
import LokiQuery from './Query'

export default function createLokiJsDatabase({ name = 'lokijs.db' } = {}): DatabaseProvider {
  // @ts-ignore
  const database = new lokidb.Loki(name)
  const collection = database.addCollection<any>('items', {})

  const query = (path: any, params: any) => {
    const to = typeof path === 'string' ? path : ''

    const opts = (typeof path === 'object' ? path : params) || {}

    return new LokiQuery<any>(to, { ...opts, db: database })
  }

  const getItem = (key: string) => collection.findOne({ key })

  const setItem = (key: string, document: any) => {
    const existed = collection.findOne({ key })

    if (existed) {
      collection.update({ $loki: existed.$loki, meta: existed.meta, ...document })
    } else {
      collection.insert(document)
    }
  }

  const removeItem = (key: string) => collection.removeWhere((doc: any) => doc.key === key)

  const clear = () => collection.removeWhere(() => true)

  const search = (to: string, params: any): Promise<[]> => query(to, params).fetch() as Promise<[]>

  const serialize = async () => await database.serialize()

  const load = (data: any) => database.loadDatabase(data)

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
export const createDatabase = createLokiJsDatabase
