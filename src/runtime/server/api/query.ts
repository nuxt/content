import { defineHandle, assertMethod, useBody } from 'h3'
import { searchContents } from '../storage'

export default defineHandle(async req => {
  assertMethod(req, 'POST')

  const body = await useBody<Partial<QueryBuilderParams>>(req)

  const contents = await searchContents(body)

  return contents
})
