import { defineHandle, assertMethod, useQuery } from 'h3'
import { useContentQuery } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta } from '../../types'

export default defineHandle(async (req) => {
  assertMethod(req, 'GET')

  const { prefix } = useQuery(req)

  const contents = await useContentQuery(prefix as string).deep(true).fetch()

  return createNav(contents as ParsedContentMeta[])
})
