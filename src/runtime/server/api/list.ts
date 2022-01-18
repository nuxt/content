import { defineHandle, assertMethod } from 'h3'
import { getContentsIds } from '../storage'

export default defineHandle(async req => {
  assertMethod(req, 'GET')

  const keys = await getContentsIds()

  return keys
})
