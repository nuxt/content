import { defineEventHandler } from 'h3'
import MiniSearch from 'minisearch'
import { serverSearchContent, splitPageIntoSections } from '../search'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { ignoredTags, filterQuery, indexed } = runtimeConfig.public.content.search

  const files = await serverSearchContent(event, filterQuery)

  const sections = files.map(page => splitPageIntoSections(page, { ignoredTags })).flat()

  if (indexed) {
    const { options } = runtimeConfig.public.content.search

    const miniSearch = new MiniSearch(options)
    miniSearch.addAll(sections)

    return JSON.stringify(miniSearch)
  }

  return sections
})
