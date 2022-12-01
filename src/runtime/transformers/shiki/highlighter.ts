import { getHighlighter, BUNDLED_LANGUAGES, BUNDLED_THEMES, Lang, Theme, Highlighter } from 'shiki-es'
import consola from 'consola'
import type { ModuleOptions } from '../../../module'
import { HighlightThemedToken } from '../../types'
import { createSingleton } from '../utils'
import mdcTMLanguage from './languages/mdc.tmLanguage.json'

// Re-create logger locally as utils cannot be imported from here
export const logger = consola.withScope('@nuxt/content')

/**
 * Resolve Shiki compatible lang from string.
 *
 * Used to resolve lang from both languages id's and aliases.
 */
const resolveLang = (lang: string): Lang =>
  (BUNDLED_LANGUAGES.find(l => l.id === lang || l.aliases?.includes(lang))?.id || lang) as Lang

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
    acc[key] = BUNDLED_THEMES.find(t => t === value)!
    return acc
  }, {} as Record<string, Theme>)
}

export const useShikiHighlighter = createSingleton((opts?: Exclude<ModuleOptions['highlight'], false>) => {
  // Grab highlighter config from publicRuntimeConfig
  const { theme, preload } = opts || {}

  let promise: Promise<Highlighter> | undefined
  const getShikiHighlighter = () => {
    if (!promise) {
      // Initialize highlighter with defaults
      promise = getHighlighter({
        theme: (theme as any)?.default || theme || 'dark-plus',
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
            aliases: ['markdown', 'md', 'mdc'],
            grammar: mdcTMLanguage
          }
        ] as any[]
      })
    }
    return promise
  }
  const getHighlightedTokens = async (code: string, lang: Lang, theme: Theme | Record<string, Theme>) => {
    const highlighter = await getShikiHighlighter()
    // Remove trailing carriage returns
    code = code.replace(/\n+$/, '')
    // Resolve lang & theme (i.e check if shiki supports them)
    lang = resolveLang(lang || '')
    theme = resolveTheme(theme || '') || { default: highlighter.getTheme() as any as Theme }

    // Skip highlight if lang is not supported
    if (!lang) {
      return [[{ content: code }]]
    }

    // Load supported language on-demand
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      let message = 'Content Highlighter Error\n\n'
      message = message + `Language "${lang}" is not loaded Shiki. Falling back to plain code.\n\n`
      message = message + `Please make sure you add "${lang}" to the 'preload' list in your Nuxt config.\n\n`
      message = message + 'See: https://content.nuxtjs.org/api/configuration#highlight'
      logger.warn(message)

      // TODO: Enable autoloading of language when upstream Shiki supports it\
      // See: https://github.com/nuxt/content/issues/1225#issuecomment-1148786924
      // await highlighter.loadLanguage(lang)
      return [[{ content: code }]]
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
      }, coloredTokens[0].tokens[line] as HighlightThemedToken[])
    }

    return highlightedCode
  }

  return {
    getHighlightedTokens
  }
})

interface HighlightThemedTokenLine {
  key: string
  tokens: HighlightThemedToken[]
}

function mergeLines (line1: HighlightThemedTokenLine, line2: HighlightThemedTokenLine) {
  const mergedTokens: HighlightThemedToken[] = []
  const getColors = (h: HighlightThemedTokenLine, i: number) => typeof h.tokens[i].color === 'string' ? { [h.key]: h.tokens[i].color } : h.tokens[i].color as object

  const right = {
    key: line1.key,
    tokens: line1.tokens.slice()
  }
  const left = {
    key: line2.key,
    tokens: line2.tokens.slice()
  }
  let index = 0
  while (index < right.tokens.length) {
    const rightToken = right.tokens[index]
    const leftToken = left.tokens[index]

    if (rightToken.content === leftToken.content) {
      mergedTokens.push({
        content: rightToken.content,
        color: {
          ...getColors(right, index),
          ...getColors(left, index)
        }
      })
      index += 1
      continue
    }

    if (rightToken.content.startsWith(leftToken.content)) {
      const nextRightToken = {
        ...rightToken,
        content: rightToken.content.slice(leftToken.content.length)
      }
      rightToken.content = leftToken.content
      right.tokens.splice(index + 1, 0, nextRightToken)
      continue
    }

    if (leftToken.content.startsWith(rightToken.content)) {
      const nextLeftToken = {
        ...leftToken,
        content: leftToken.content.slice(rightToken.content.length)
      }
      leftToken.content = rightToken.content
      left.tokens.splice(index + 1, 0, nextLeftToken)
      continue
    }

    throw new Error('Unexpected token')
  }
  return mergedTokens
}
