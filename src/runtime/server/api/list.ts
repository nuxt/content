import { defineHandle, assertMethod } from 'h3'
import { getContentsList } from '../storage'

export default defineHandle(async req => {
  assertMethod(req, 'GET')

  const keys = await getContentsList()

  return keys
})
