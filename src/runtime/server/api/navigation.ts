import { defineEventHandler } from 'h3'
import { cacheStorage, serverQueryContent } from '../storage'
import { createNav } from '../navigation'
import type { ParsedContent, ParsedContentMeta } from '../../types'
import { getContentQuery } from '../../utils/query'
import { isPreview } from '../preview'

export default defineEventHandler(async (event) => {
  const query = getContentQuery(event)

  // Read from cache if not preview and there is no query
  if (!isPreview(event) && Object.keys(query).length === 0) {
    const cache = await cacheStorage.getItem('content-navigation.json')
    if (cache) {
      return cache
    }
  }

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

  const dirConfigs = await serverQueryContent(event)
    .where({ _path: /\/_dir$/i, _partial: true })
    .find()

  const configs = (dirConfigs?.result || dirConfigs).reduce((configs, conf: ParsedContent) => {
    if (conf.title?.toLowerCase() === 'dir') {
      conf.title = undefined
    }
    const key = conf._path!.split('/').slice(0, -1).join('/') || '/'
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body
    }
    return configs
  }, {} as Record<string, ParsedContentMeta>)

  return createNav((contents?.result || contents) as ParsedContentMeta[], configs)
})
