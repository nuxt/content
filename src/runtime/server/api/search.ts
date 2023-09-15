import { defineEventHandler } from 'h3'
import { splitPageIntoSections } from '../search'
import { useRuntimeConfig } from '#imports'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { ignoredTags, ignoreWhere } = runtimeConfig.public.content.search

  const filesPromise = serverQueryContent(event)

  if (ignoreWhere) {
    serverQueryContent(event).where(ignoreWhere)
  }

  const files = await filesPromise

  // Only works for MD
  const sections = (await Promise.all(
    files
      .map(page => splitPageIntoSections(page, { ignoredTags }))))
    .flat()

  return sections
})
