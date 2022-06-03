import { defineEventHandler } from 'h3'
import { serverQueryContent } from '../storage'
import { createNav } from '../navigation'
import { ParsedContentMeta } from '../../types'
import { getContentQuery } from '../../utils/query'

export default defineEventHandler(async (event) => {
  const query = getContentQuery(event)

  const contents = await serverQueryContent(event, query)
    .where({
      /**
       * Partial contents are not included in the navigation
       * A partial content is a content that has `_` prefix in its path
       */
      _partial: false,
      /**
       * Exclude any pages which have opted out of navigation via frontmatter.
       */
      navigation: {
        $ne: false
      }
    })
    .find()

  const dirConfigs = await serverQueryContent(event).where({ _path: /\/_dir$/i, _partial: true }).find()
  const configs = dirConfigs.reduce((configs, conf) => {
    if (conf.title.toLowerCase() === 'dir') {
      conf.title = undefined
    }
    const key = conf._path.split('/').slice(0, -1).join('/') || '/'
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body
    }
    return configs
  }, {} as Record<string, ParsedContentMeta>)

  return createNav(contents as ParsedContentMeta[], configs)
})
