import { createError, defineEventHandler } from 'h3'
import { withLeadingSlash } from 'ufo'
import { cacheStorage, getContent, serverQueryContent } from '../storage'

// This route is used to cache all the parsed content
export default defineEventHandler(async (event) => {
  let index = await cacheStorage.getItem('index.json') as Record<string, string>
  if (!index) {
    // Fetch all content
    const data = await serverQueryContent(event).find()

    index = data.reduce((acc, item) => {
      acc[item._path!] = item._id
      return acc
    }, {} as Record<string, string>)

    await cacheStorage.setItem('index.json', index)
  }

  const slug = withLeadingSlash(event.context.params.slug)

  if (!index[slug]) {
    throw createError({
      statusMessage: 'Document not found!',
      statusCode: 404,
      data: {
        description: 'Could not find document for the given path.',
        path: slug
      }
    })
  }

  return getContent(event, index[slug])
})
