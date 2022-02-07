import { defineHandle, assertMethod } from 'h3'
import { getContent } from '../storage'

export default defineHandle((req) => {
  assertMethod(req, 'GET')

  const key = (req.url || '/').split('/')[1] || ''

  return getContent(key)
})
