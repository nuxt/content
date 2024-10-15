import type { PageCollections, PageCollectionItemBase } from '@nuxt/content'
import { generateNavigationTree } from './internal/generateNavigationTree'
import { queryCollection } from './queryCollection'

export async function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>) {
  const collecitonItems = await queryCollection<T>(collection)
    .order('weight', 'ASC')
    .order('stem', 'ASC')
    .where('navigation', '<>', '"false"')
    .select('navigation', 'stem', 'path', 'title', ...(fields || []))
    .all() as unknown as PageCollectionItemBase[]

  const { contents, configs } = collecitonItems.reduce((acc, c) => {
    if (String(c.stem).split('/').pop() === '.navigation') {
      c.title = c.title?.toLowerCase() === 'navigation' ? '' : c.title
      const key = c.path!.split('/').slice(0, -1).join('/') || '/'
      acc.configs[key] = {
        ...c,
        ...c.body,
      }
    }
    else {
      acc.contents.push(c)
    }
    return acc
  }, { configs: {}, contents: [] } as { configs: Record<string, PageCollectionItemBase>, contents: PageCollectionItemBase[] })

  return generateNavigationTree(contents, configs, (fields || []) as string[])
}
