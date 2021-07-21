import { useStorage } from '../storage'
import { DatabaseProvider } from '../runtime/database'
import { getTransformer } from '../transformers'
import { createLokiJsDatabase } from '../runtime/database/providers/lokijs'
import { omit } from '../runtime/utils/object'

export async function getData(id: string) {
  return {
    body: await useStorage()?.getItem(id),
    meta: { mtime: new Date() }
    // meta: storage.getMeta(id)
  }
}

export async function getContent(id: string) {
  const data = await getData(id)
  if (typeof data.body === 'undefined' || data.body === null) {
    throw new Error(`Content not found: ${id}`)
  }
  const transformResult = await getTransformer(id)(id, data.body as any)
  return {
    meta: {
      ...data.meta,
      ...transformResult.meta
    },
    body: transformResult.body
  }
}

export function getKeys(id?: string) {
  return useStorage()?.getKeys(id)
}

export async function getList(id?: string) {
  const ids = (await getKeys(id)) || []
  return Promise.all(
    ids.map(async id => {
      const content = await getContent(id)
      return {
        id,
        ...content.meta
      }
    })
  )
}

let db: DatabaseProvider | null
export function resetDatabase() {
  db = null
}
export async function getDatabase() {
  if (!db) {
    db = createLokiJsDatabase('docus.db')
    const storage = useStorage()
    const navigation = (await storage?.getItem('data:docus:navigation')) as any

    function index(item: any) {
      if (item.page) {
        db?.setItem(item.id, omit(['children'])(item))
      }
      if (item.children) {
        item.children.forEach(index)
      }
    }

    Object.values(navigation || {})
      .flatMap(i => i)
      .forEach(index)
  }
  return db
}

export async function searchContent(to: string, body: any) {
  const db = await getDatabase()

  return db.search(to, body)
}
