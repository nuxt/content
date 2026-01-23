import { withLeadingSlash } from 'ufo'
import { stringify } from 'minimark/stringify'
import { queryCollection } from '@nuxt/content/server'
import type { Collections, PageCollectionItemBase, ResolvedCollection } from '@nuxt/content'
import { getRouterParams, eventHandler, createError, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import collections from '#content/manifest'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const llmsConfig = config.llms as { contentRawMarkdown: false | { excludeCollections: string[] } }
  const slug = getRouterParams(event)['slug.md']
  if (!slug?.endsWith('.md') || llmsConfig?.contentRawMarkdown === false) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  let path = withLeadingSlash(slug.replace('.md', ''))
  if (path.endsWith('/index')) {
    path = path.substring(0, path.length - 6)
  }

  const excludeCollections = llmsConfig?.contentRawMarkdown?.excludeCollections || []
  const _collections = Object.entries(collections as Record<string, ResolvedCollection>)
    .filter(([_key, value]) => value.type === 'page' && !excludeCollections.includes(_key))
    .map(([key]) => key) as string[]

  let page: PageCollectionItemBase | null = null
  for (const collection of _collections) {
    page = await queryCollection(event, collection as keyof Collections).path(path).first() as PageCollectionItemBase | null
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
