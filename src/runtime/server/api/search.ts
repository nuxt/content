import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { serverSearchContent, splitPageIntoSections } = await import('../search')
  const MiniSearch = await import('minisearch').then(m => m.default)

  const runtimeConfig = useRuntimeConfig()
  const { ignoredTags = [], filterQuery, indexed, options } = runtimeConfig.public.content.search!

  const files = await serverSearchContent(event, filterQuery)

  const sections = files.map(page => splitPageIntoSections(page, { ignoredTags })).flat()

  if (indexed) {
    const miniSearch = new MiniSearch(options!)
    miniSearch.addAll(sections)

    return JSON.stringify(miniSearch)
  }

  return sections
})
