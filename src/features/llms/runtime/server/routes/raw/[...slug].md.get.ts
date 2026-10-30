import { createError, defineEventHandler, getRouterParams, useRuntimeConfig } from 'nuxt/server'
import { getRawMarkdown } from '../../raw-markdown'
import type { ContentRawMarkdownConfig } from '../../raw-markdown'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const markdown = await getRawMarkdown(event, getRouterParams(event)['slug.md'], config.llms as ContentRawMarkdownConfig)
  if (markdown === undefined) {
    throw createError({ status: 404, statusText: 'Page not found', fatal: true })
  }

  event.res.headers.set('Content-Type', 'text/markdown; charset=utf-8')
  return markdown
})
