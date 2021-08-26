import { getTransformer } from '../transformers'
import { useDB } from '../database'
import { generateNavigation } from '../navigation'
import { cachify } from './utils/cache'
// @ts-ignore
import { storage } from '#storage'

const isProduction = process.env.NODE_ENV === 'production'
const withCache = (name: string, fn: any) => (isProduction ? cachify(fn, { name, swr: true, ttl: 60000 }) : fn)

export async function getData(id: string) {
  return {
    body: await storage.getItem(id),
    meta: { mtime: new Date() }
    // meta: storage.getMeta(id)
  }
}

export const getKeys = withCache('getKeys', getKeysNoCache)
// without cache
function getKeysNoCache(id?: string) {
  return storage.getKeys(id)
}

export const getContent = withCache('getContent', getContentNoCache)
// without cache
async function getContentNoCache(id: string) {
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

export const getList = withCache('getList', getListNoCache)
// without cache
async function getListNoCache(id?: string) {
  const ids: string[] = (await getKeys(id)) || []
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

export const searchContent = withCache('searchContent', searchContentNoCache)
// without cache
async function searchContentNoCache(to: string, body: any) {
  const db = await useDB()

  return db.search(to, body)
}

export const getNavigation = withCache('getNavigation', generateNavigation)
