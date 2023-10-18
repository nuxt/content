import { defineEventHandler } from 'h3'
import { serverSearchContent, splitPageIntoSections } from '../search'
import { useRuntimeConfig } from '#imports'
import MiniSearch from 'minisearch'

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
