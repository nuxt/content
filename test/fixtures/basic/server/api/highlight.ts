import { defineEventHandler, readBody } from 'h3'
import { useShikiHighlighter } from '../../../../../src/runtime/transformers/shiki/highlighter'
import type { HighlightParams } from '../../../../../src/runtime/types'
import { useRuntimeConfig } from '#imports'

const resolveBody = (body: Partial<HighlightParams>) => {
  return {
    // Remove trailing carriage returns
    code: (body.code || '').replace(/\n+$/, ''),
    // Resolve lang & theme (i.e check if shiki supports them)
    lang: body.lang,
    theme: body.theme
  }
}

export default defineEventHandler(async (event) => {
  const params = await readBody<Partial<HighlightParams>>(event)

  const { code, lang, theme } = resolveBody(params)

  const highlighter = await useShikiHighlighter(useRuntimeConfig().highlight)

  return highlighter.getHighlightedTokens(code, lang as any, theme as any)
})
