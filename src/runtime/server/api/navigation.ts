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

  const dirConfigs = await queryContent().where({ path: /\/_dir$/i, partial: true }).find()
  const configs = dirConfigs.reduce((configs, conf) => {
    if (conf.title.toLowerCase() === 'dir') {
      conf.title = undefined
    }
    const key = conf.path.split('/').slice(0, -1).join('/')
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body
    }
    return configs
  }, {} as Record<string, ParsedContentMeta>)

  return createNav(contents as ParsedContentMeta[], configs)
})
