import type { NavigationItem } from '@comark/cms'

export interface SurroundOptions {
  before?: number
  after?: number
  fields?: string[]
}

export async function generateItemSurround(navigation: NavigationItem[], path: string, opts?: SurroundOptions) {
  const { before = 1, after = 1, fields = [] } = opts || {}

  const flatData = flattedData(navigation)
  const index = flatData.findIndex(item => item.path === path)
  const beforeItems = index === -1 ? [] : flatData.slice(index - before, index)
  const afterItems = index === -1 ? [] : flatData.slice(index + 1, index + after + 1)

  return [
    ...(Array.from({ length: before }).fill(null).concat(beforeItems).slice(beforeItems.length)),
    ...afterItems.concat(Array.from({ length: after }).fill(null) as typeof afterItems).slice(0, after),
  ] as (NavigationItem | null)[]
}

export function flattedData(data: NavigationItem[]) {
  const flatData = data.flatMap((item) => {
    const children: NavigationItem[] = item.children ? flattedData(item.children) : []
    if (item.page === false || (children.length && children.find(c => c.path === item.path))) {
      return children
    }

    return [{ ...item, children: undefined }, ...children]
  })

  return flatData
}
