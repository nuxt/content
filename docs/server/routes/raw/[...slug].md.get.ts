import type { Collections } from '@nuxt/content'
// import { queryCollection } from '@nuxt/content/nitro'
import { stringify } from 'minimark'
import { withLeadingSlash } from 'ufo'

export default eventHandler(async (event) => {
  const slug = getRouterParams(event)['slug.md']
  if (!slug?.endsWith('.md')) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  const [collection] = String(slug).split('/')
  const path = withLeadingSlash(slug).slice(0, -3)

  const page = await queryCollection(event, collection as keyof Collections)
    .path(path).first()
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  // Add title and description to the top of the page if missing
  if (page.body.value[0]?.[0] !== 'h1') {
    page.body.value.unshift(['blockquote', {}, page.description])
    page.body.value.unshift(['h1', {}, page.title])
  }

  setHeader(event, 'Content-Type', 'text/markdown')
  return stringify(page.body)
})
