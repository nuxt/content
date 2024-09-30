import type { PageCollections } from '@farnabaz/content-next'
import type { PageCollectionItemBase } from '../../types'
import { generateNavigationTree } from './internal/generateNavigationTree'
import { queryCollection } from './queryCollection'

export async function getCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>) {
  const contents = await queryCollection<T>(collection)
    .order('weight', 'ASC')
    .order('stem', 'ASC')
    .where('navigation', '<>', '"false"')
    .select('navigation', 'stem', 'path', 'title', ...(fields || []))
    .all() as unknown as PageCollectionItemBase[]

  // TODO: We should rethink about dir configs and their impact on navigation
  const dirConfigs = contents.filter(c => String(c.stem).endsWith('dir'))
  const configs = dirConfigs.reduce((configs, conf) => {
    if (conf.title?.toLowerCase() === 'dir') {
      conf.title = ''
    }
    const key = conf.path!.split('/').slice(0, -1).join('/') || '/'
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body,
    }
    return configs
  }, {} as Record<string, PageCollectionItemBase>)

  return generateNavigationTree(contents.filter(c => !String(c.stem).endsWith('dir')), configs, (fields || []) as string[])
}
