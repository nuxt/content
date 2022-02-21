import { lazyHandle, assertMethod, useBody, createError } from 'h3'
import { getHighlighter, BUNDLED_LANGUAGES, Lang } from 'shiki-es'
import { HighlightParams, HighlightThemedToken } from '../../types'

const resolveLang = (lang: string): Lang | undefined =>
  BUNDLED_LANGUAGES.find(l => l.id === lang || l.aliases?.includes(lang))?.id as Lang

export default lazyHandle(async () => {
  // Initialize highlighter with defaults
  const highlighter = await getHighlighter({
    theme: 'dark-plus',
    langs: ['js', 'ts', 'html', 'css']
  })

  return async (req): Promise<HighlightThemedToken[][]> => {
    assertMethod(req, 'POST')

    const body = await useBody<Partial<HighlightParams>>(req)

    // Assert body schema
    if (!(typeof body.code === 'string' && typeof body.lang === 'string')) {
      throw createError({ statusMessage: 'Bad Request', statusCode: 400 })
    }

    // Remove trailing carriage returns
    const code = body.code.replace(/\n+$/, '')

    // Resolve lang (i.e check if shiki supports it)
    const lang = resolveLang(body.lang)

    // Skip highlight if lang is not supported
    if (!lang) {
      return [[{ content: code }]]
    }

    // Load supported language on-demand
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      await highlighter.loadLanguage(lang)
    }

    // Highlight code
    const highlightedCode = highlighter.codeToThemedTokens(code, lang)

    // Clean up to shorten response payload
    for (const line of highlightedCode) {
      for (const token of line) {
        delete token.fontStyle
        delete token.explanation
      }
    }

    return highlightedCode
  }
})
