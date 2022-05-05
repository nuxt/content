import { defineEventHandler, useQuery } from 'h3'
import { queryContent, useApiQuery } from '../storage'
import { createNav } from '../navigation'
import { togglePreviewMode } from '../preview'
import { ParsedContentMeta, QueryBuilderParams } from '../../types'

export default defineEventHandler(async (event) => {
  const { query: qid } = event.context.params
  const query: Partial<QueryBuilderParams> = useApiQuery(qid, useQuery(event)?.params || undefined)

  await togglePreviewMode(event)

  const contents = await queryContent(query)
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
