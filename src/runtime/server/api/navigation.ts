import { defineHandle, assertMethod, isMethod, useBody } from 'h3'
import { queryContent } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta } from '../../types'

export default defineHandle(async (req) => {
  assertMethod(req, ['GET', 'POST'])

  const params = isMethod(req, 'POST') ? await useBody(req) : {}

  const contents = await queryContent(params || {})
    .where({
      /**
       * Partial contents are not included in the navigation
       * A partial content is a content that has `_` prefix in its path
       */
      partial: false
    })
    .find()

  return createNav(contents as ParsedContentMeta[])
})
