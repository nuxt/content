import { defineHandle, assertMethod, isMethod, useBody } from 'h3'
import { useContentQuery } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta } from '../../types'

export default defineHandle(async (req) => {
  assertMethod(req, ['GET', 'POST'])

  const params = isMethod(req, 'POST') ? await useBody(req) : {}

  const contents = await useContentQuery(params || {}).find()

  return createNav(contents as ParsedContentMeta[])
})
