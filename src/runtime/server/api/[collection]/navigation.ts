import { eventHandler, getRouterParam, createError, getQuery } from 'h3'
import type { CollectionInfo, Collections } from '@farnabaz/content-next'
import { createNav } from '../../navigation'
import { collections } from '#content-v3/collections'
import { queryCollection } from '#imports'

export default eventHandler(async (event) => {
  const collectionName = getRouterParam(event, 'collection')
  const { fields } = getQuery(event)
  const collection = (collections as CollectionInfo[]).find((c: CollectionInfo) => c.name === collectionName)

  if (!collection) {
    throw createError({
      statusCode: 404,
      message: `Collection ${collectionName} not found`,
    })
  }

  const extraFields = fields ? String(fields).split(',') : []

  const contents = await queryCollection(collection.name as keyof Collections)
    .order('weight', 'ASC')
    .order('stem', 'ASC')
    .select('stem', 'path', 'title', ...extraFields)
    .all() as any[]

  // TODO: We should rethink about dir configs and their impact on navigation
  const dirConfigs = contents.filter(c => String(c.stem).endsWith('dir'))
  const configs = dirConfigs.reduce((configs, conf) => {
    if (conf.title?.toLowerCase() === 'dir') {
      conf.title = undefined
    }
    const key = conf.path!.split('/').slice(0, -1).join('/') || '/'
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body,
    }
    return configs
  }, {})

  return createNav(contents.filter(c => !String(c.stem).endsWith('dir')), configs, extraFields)
})
