import { eventHandler } from 'h3'
import { collectionsInfo, loadDatabaseDump } from '../../utils/internal/app.server'
import type { CollectionInfo } from '../../../types'

export default eventHandler(async () => {
  const dump: string = await loadDatabaseDump()
  const collections = collectionsInfo

  return {
    collections: Object.fromEntries(
      Object.entries(collections)
        .map(([name, meta]) => [name, { jsonFields: (meta as CollectionInfo).jsonFields }]),
    ),
    dump,
  }
})
