import type { PageCollections, ContentNavigationItem, SurroundOptions } from '@farnabaz/content-next'
import { getCollectionNavigation } from './getCollectionNavigation'

export async function getSurroundingCollectionItems<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>) {
  const { before = 1, after = 1, fields = [] } = opts || {}
  const navigation = await getCollectionNavigation(collection, fields)

  const flatData = flattedData(navigation)
  const index = flatData.findIndex(item => item.path === path)
  const beforeItems = flatData.slice(index - before, index)
  const afterItems = flatData.slice(index + 1, index + after + 1)

  return [
    ...(Array.from({ length: before }).fill(null).concat(beforeItems).slice(beforeItems.length)),
    ...afterItems.concat(Array.from({ length: after }).fill(null) as typeof afterItems).slice(0, after),
  ] as ContentNavigationItem[]
}

function flattedData(data: ContentNavigationItem[]) {
  const flatData = data.flatMap((item) => {
    const children: ContentNavigationItem[] = item.children ? flattedData(item.children) : []

    return item.page === false ? children : [{ ...item, children: undefined }, ...children]
  })

  return flatData
}
