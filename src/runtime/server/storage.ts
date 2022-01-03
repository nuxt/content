import { prefixStorage } from 'unstorage'
import { storage } from '#storage'

export const contentStorage = prefixStorage(storage, 'docus:source')

export const getContentsList = async (prefix?: string) => {
  const keys = await contentStorage.getKeys(prefix)

  return keys
}

export const getContent = async (key: string) => {
  const body = await contentStorage.getItem(key)
  const meta = await contentStorage.getMeta(key)

  return {
    meta,
    body
  }
}
