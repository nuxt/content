import { defineEventHandler, assertMethod } from 'h3'
import { queryContent } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta, QueryBuilderParams } from '../../types'
import { contentApiParams } from '../utils'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'GET')

  const params: Partial<QueryBuilderParams> = contentApiParams(event)

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
