import { defineEventHandler } from 'h3'
import { serverSearchContent, splitPageIntoSections } from '../search'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { ignoredTags, ignoreQuery } = runtimeConfig.public.content.search

  const files = await serverSearchContent(event, ignoreQuery)

  const sections = (await Promise.all(
    files
      .map(page => splitPageIntoSections(page, { ignoredTags }))))
    .flat()

  return sections
})
