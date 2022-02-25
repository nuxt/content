import { lazyHandle, assertMethod, useBody, createError } from 'h3'
import { getHighlighter, BUNDLED_LANGUAGES, BUNDLED_THEMES, Lang, Theme } from 'shiki-es'
import { HighlightParams, HighlightThemedToken } from '../../types'

const resolveLang = (lang: string): Lang | undefined =>
  BUNDLED_LANGUAGES.find(l => l.id === lang || l.aliases?.includes(lang))?.id as Lang

const resolveTheme = (theme: string): Theme | undefined =>
  BUNDLED_THEMES.find(t => t === theme)

const resolveBody = (body: Partial<HighlightParams>): { code: string, lang?: Lang, theme?: Theme } => {
  // Assert body schema
  if (!(
    typeof body.code === 'string' &&
    typeof body.lang === 'string' &&
    (typeof body.theme === 'string' || typeof body.theme === 'undefined')
  )) {
    throw createError({ statusMessage: 'Bad Request', statusCode: 400 })
  }

  return {
    // Remove trailing carriage returns
    code: body.code.replace(/\n+$/, ''),
    // Resolve lang & theme (i.e check if shiki supports them)
    lang: resolveLang(body.lang),
    theme: resolveTheme(body.theme)
  }
}

export default lazyHandle(async () => {
  // Initialize highlighter with defaults
  const highlighter = await getHighlighter({
    theme: 'dark-plus',
    langs: ['js', 'ts', 'html', 'css']
  })

  return async (req): Promise<HighlightThemedToken[][]> => {
    assertMethod(req, 'POST')

    const body = await useBody<Partial<HighlightParams>>(req)

    const { code, lang, theme } = resolveBody(body)

    // Skip highlight if lang is not supported
    if (!lang) {
      return [[{ content: code }]]
    }

    // Load supported language on-demand
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      await highlighter.loadLanguage(lang)
    }

    // Load supported theme on-demand
    if (theme && !highlighter.getLoadedThemes().includes(theme)) {
      await highlighter.loadTheme(theme)
    }

    // Highlight code
    const highlightedCode = highlighter.codeToThemedTokens(code, lang, theme)

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
