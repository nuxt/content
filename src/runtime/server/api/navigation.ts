import { defineEventHandler } from 'h3'
import { serverQueryContent } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta, QueryBuilderParams } from '../../types'
import { useApiParams } from '../params'

export default defineEventHandler(async (event) => {
  const query: Partial<QueryBuilderParams> = useApiParams(event)

  const contents = await serverQueryContent(event, query)
    .where({
      /**
       * Partial contents are not included in the navigation
       * A partial content is a content that has `_` prefix in its path
       */
      partial: false
    })
    .find()

  const dirConfigs = await serverQueryContent(event).where({ path: /\/_dir$/i, partial: true }).find()
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
