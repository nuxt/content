import { getRouterParams, eventHandler, createError, setHeader } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { getRawMarkdown } from '../../raw-markdown'
import type { ContentRawMarkdownConfig } from '../../raw-markdown'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const markdown = await getRawMarkdown(event, getRouterParams(event)['slug.md'], config.llms as ContentRawMarkdownConfig)
  if (markdown === undefined) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  return markdown
})
