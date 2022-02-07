import { defineHandle, assertMethod, useBody } from 'h3'
import { queryContent } from '../storage'
import type { QueryBuilderParams } from '../../types'

export default defineHandle(async (req) => {
  assertMethod(req, 'POST')

  const body = await useBody<Partial<QueryBuilderParams>>(req)

  const contents = await queryContent(body).fetch()

  return contents
})
