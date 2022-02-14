import { defineHandle, assertMethod, useBody } from 'h3'
import { useContentQuery } from '../storage'
import type { QueryBuilderParams } from '../../types'

export default defineHandle(async (req) => {
  assertMethod(req, 'POST')

  const body = await useBody<Partial<QueryBuilderParams>>(req)

  const contents = await useContentQuery(body).find()

  return contents
})
