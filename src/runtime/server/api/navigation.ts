import { defineEventHandler } from 'h3'
import { queryContent } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta, QueryBuilderParams } from '../../types'
import { decodeApiParams } from '../../utils'

export default defineEventHandler(async (event) => {
  const params = decodeApiParams<Partial<QueryBuilderParams>>(event.context.params.params)

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
