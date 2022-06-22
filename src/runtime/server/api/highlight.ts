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
const resolveTheme = (theme: string | Record<string, string>): Record<string, Theme> | undefined => {
  if (!theme) {
    return
  }
  if (typeof theme === 'string') {
    theme = {
      default: theme
    }
  }

  return Object.entries(theme).reduce((acc, [key, value]) => {
    acc[key] = BUNDLED_THEMES.find(t => t === value)
    return acc
  }, {})
}

/**
 * Resolve Shiki highlighter compatible payload from request body.
 */
const resolveBody = (body: Partial<HighlightParams>) => {
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
    theme: theme?.default || theme || 'dark-plus',
    langs: [
      ...(preload || []),
      'diff',
      'json',
      'js',
      'ts',
      'css',
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

    const { code, lang, theme = { default: highlighter.getTheme() } } = resolveBody(params)

    // Skip highlight if lang is not supported
    if (!lang) {
      return [[{ content: code }]]
    }

    // Load supported language on-demand
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      await highlighter.loadLanguage(lang)
    }

    // Load supported theme on-demand
    await Promise.all(
      Object.values(theme).map(async (theme) => {
        if (!highlighter.getLoadedThemes().includes(theme)) {
          await highlighter.loadTheme(theme)
        }
      })
    )

    // Highlight code
    const coloredTokens = Object.entries(theme).map(([key, theme]) => {
      const tokens = highlighter.codeToThemedTokens(code, lang, theme)
      return {
        key,
        theme,
        tokens
      }
    })

    const highlightedCode: HighlightThemedToken[][] = []
    for (const line in coloredTokens[0].tokens) {
      highlightedCode[line] = coloredTokens.reduce((acc, color) => {
        return mergeLines({
          key: coloredTokens[0].key,
          tokens: acc
        }, {
          key: color.key,
          tokens: color.tokens[line]
        })
      }, coloredTokens[0].tokens[line])
    }

    return highlightedCode
  }
})

function mergeLines (line1, line2) {
  const mergedTokens = []
  const getColors = (h, i) => typeof h.tokens[i].color === 'string' ? { [h.key]: h.tokens[i].color } : h.tokens[i].color

  const [big, small] = line1.tokens.length > line2.tokens.length ? [line1, line2] : [line2, line1]
  let targetToken = 0
  let targetTokenCharIndex = 0
  big.tokens.forEach((t, i) => {
    if (targetTokenCharIndex === 0) {
      if (t.content === small.tokens[i]?.content) {
        mergedTokens.push({
          content: t.content,
          color: {
            ...getColors(big, i),
            ...getColors(small, i)
          }
        })
        targetToken = i + 1
        return
      }
      if (t.content === small.tokens[targetToken]?.content) {
        mergedTokens.push({
          content: t.content,
          color: {
            ...getColors(big, i),
            ...getColors(small, targetToken)
          }
        })
        targetToken += 1
        return
      }
    }

    if (small.tokens[targetToken]?.content?.substring(targetTokenCharIndex, targetTokenCharIndex + t.content.length) === t.content) {
      targetTokenCharIndex += t.content.length
      mergedTokens.push({
        content: t.content,
        color: {
          ...getColors(big, i),
          ...getColors(small, targetToken)
        }
      })
    }
    if (small.tokens[targetToken]?.content.length <= targetTokenCharIndex) {
      targetToken += 1
      targetTokenCharIndex = 0
    }
  })
  return mergedTokens
}
