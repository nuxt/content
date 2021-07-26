import Loki from '@lokidb/loki'
import { DatabaseProvider } from '../../../../types'
import LokiQuery from './Query'

export function createLokiJsDatabase(name = 'lokijs.db'): DatabaseProvider {
  const database = new Loki(name)
  const colleciton = database.addCollection<any>('items', {})

  const query = (path: any, params: any) => {
    const to = typeof path === 'string' ? path : ''
    const opts = (typeof path === 'object' ? path : params) || {}
    return new LokiQuery<any>(to, { ...opts, db: database })
  }

  const getItem = (key: string) => colleciton.findOne({ key })

  const setItem = (key: string, document: any) => {
    const existed = colleciton.findOne({ key })

    if (existed) {
      colleciton.update({ $loki: existed.$loki, meta: existed.meta, ...document })
    } else {
      colleciton.insert(document)
    }
  }

  const removeItem = (key: string) => colleciton.removeWhere(doc => doc.key === key)

  const clear = () => colleciton.removeWhere(() => true)

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
