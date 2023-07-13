import { defineEventHandler } from 'h3'
import MiniSearch from 'minisearch'
import { splitPageIntoSections } from '../search'
import { useRuntimeConfig } from '#imports'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { ignoredTags, ignoreDrafts, ignorePartials, ignoreEmpty, options } = runtimeConfig.public.content.search

  const files = await serverQueryContent(event).find()

  // Only works for MD
  const sections = (await Promise.all(
    files
      .filter(file => file._extension === 'md' &&
      (!ignoreDrafts ? true : !file?._draft) &&
      (!ignoreEmpty ? true : !file?._empty) &&
      (!ignorePartials ? true : !file?._partial)
      )
      .map(page => splitPageIntoSections(page, { ignoredTags }))))
    .flat()

  // Add an option to enable index
  const miniSearch = new MiniSearch(options)

  // Index the documents
  miniSearch.addAll(sections)

  // Send the index to the client
  return JSON.stringify(miniSearch)
})
