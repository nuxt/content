import { createError, defineLazyEventHandler, useBody } from 'h3'
import { getHighlighter, BUNDLED_LANGUAGES, BUNDLED_THEMES, Lang, Theme } from 'shiki-es'
import { HighlightParams, HighlightThemedToken } from '../../types'
import mdcTMLanguage from '../../assets/mdc.tmLanguage.json'
import { useRuntimeConfig } from '#imports'

/**
 * Resolve Shiki compatible lang from string.
 *
 * Used to resolve lang from both languages id's and aliases.
 */
const resolveLang = (lang: string): Lang | undefined =>
  BUNDLED_LANGUAGES.find(l => l.id === lang || l.aliases?.includes(lang))?.id as Lang

/**
 * Resolve Shiki compatible theme from string.
 */
const resolveTheme = (theme: string): Theme | undefined =>
  BUNDLED_THEMES.find(t => t === theme)

/**
 * Resolve Shiki highlighter compatible payload from request body.
 */
const resolveBody = (body: Partial<HighlightParams>): { code: string, lang?: Lang, theme?: Theme } => {
  // Assert body schema
  if (typeof body.code !== 'string') { throw createError({ statusMessage: 'Bad Request', statusCode: 400, message: 'Missing code key.' }) }

  return {
    // Remove trailing carriage returns
    code: body.code.replace(/\n+$/, ''),
    // Resolve lang & theme (i.e check if shiki supports them)
    lang: resolveLang(body.lang),
    theme: resolveTheme(body.theme)
  }
}

export default defineLazyEventHandler(async () => {
  // Grab highlighter config from publicRuntimeConfig
  const { theme, preload } = useRuntimeConfig().content.highlight

  // Initialize highlighter with defaults
  const highlighter = await getHighlighter({
    theme: theme || 'dark-plus',
    langs: [
      ...(preload || ['json', 'js', 'ts', 'css']),
      'shell',
      'html',
      'md',
      'yaml',
      {
        id: 'md',
        scopeName: 'text.markdown.mdc',
        path: 'mdc.tmLanguage.json',
        aliases: ['markdown'],
        grammar: mdcTMLanguage
      }
    ] as any[]
  })

  return async (event): Promise<HighlightThemedToken[][]> => {
    const params = await useBody<Partial<HighlightParams>>(event)

    const { code, lang, theme } = resolveBody(params)

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
