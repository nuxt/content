import { withLeadingSlash } from 'ufo'
import { stringify } from 'minimark/stringify'
import { queryCollection } from '@nuxt/content/server'
import type { Collections } from '@nuxt/content'
import { getRouterParams, eventHandler, createError, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import collections from '#content/manifest'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const slug = getRouterParams(event)['slug.md']
  if (!slug?.endsWith('.md') || config.llms?.contentRawMD === false) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  let path = withLeadingSlash(slug.replace('.md', ''))
  if (path.endsWith('/index')) {
    path = path.substring(0, path.length - 6)
  }

  const _collections = Object.entries(collections)
    .filter(([key, value]) => value.type === 'page')
    .map(([key]) => key) as string[]

  let page = null
  for (const collection of _collections) {
    page = await queryCollection(event, collection as keyof Collections).path(path).first()
    if (page) {
      break
    }
  }

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  // Add title and description to the top of the page if missing
  if (page.body.value[0]?.[0] !== 'h1') {
    page.body.value.unshift(['blockquote', {}, page.description])
    page.body.value.unshift(['h1', {}, page.title])
  }

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  return stringify({ ...page.body, type: 'minimark' }, { format: 'markdown/html' })
})
