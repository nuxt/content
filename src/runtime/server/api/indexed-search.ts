import { defineEventHandler } from 'h3'
import MiniSearch from 'minisearch'
import { serverSearchContent, splitPageIntoSections } from '../search'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { ignoredTags, ignoreQuery, options } = runtimeConfig.public.content.search

  const files = await serverSearchContent(event, ignoreQuery)

  console.log("files",files)

  const sections = (await Promise.all(
    files
      .map(page => splitPageIntoSections(page, { ignoredTags }))))
    .flat()

  // Add an option to enable index
  const miniSearch = new MiniSearch(options)

  // Index the documents
  miniSearch.addAll(sections)

  // Send the index to the client
  return JSON.stringify(miniSearch)
})
