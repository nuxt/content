import { generateNavigationTree } from './navigation'
import type { ContentNavigationItem, PageCollectionItemBase, SurroundOptions } from '@nuxt/content'
import type { CollectionQueryBuilder } from '~/src/types'

export async function generateItemSurround<T extends PageCollectionItemBase>(queryBuilder: CollectionQueryBuilder<T>, path: string, opts?: SurroundOptions<keyof T>) {
  const { before = 1, after = 1, fields = [] } = opts || {}
  const navigation = await generateNavigationTree(queryBuilder, fields)

  const flatData = flattedData(navigation)
  const index = flatData.findIndex(item => item.path === path)
  const beforeItems = index === -1 ? [] : flatData.slice(index - before, index)
  const afterItems = index === -1 ? [] : flatData.slice(index + 1, index + after + 1)

  return [
    ...(Array.from({ length: before }).fill(null).concat(beforeItems).slice(beforeItems.length)),
    ...afterItems.concat(Array.from({ length: after }).fill(null) as typeof afterItems).slice(0, after),
  ] as ContentNavigationItem[]
}

export function flattedData(data: ContentNavigationItem[]) {
  const flatData = data.flatMap((item) => {
    const children: ContentNavigationItem[] = item.children ? flattedData(item.children) : []
    if (item.page === false || (children.length && children.find(c => c.path === item.path))) {
      return children
    }

    return [{ ...item, children: undefined }, ...children]
  })

  return flatData
}
