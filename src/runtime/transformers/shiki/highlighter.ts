import { getHighlighter, BUNDLED_LANGUAGES, BUNDLED_THEMES, Lang, Theme as ShikiTheme, Highlighter } from 'shiki-es'
import consola from 'consola'
import type { ModuleOptions } from '../../../module'
import { createSingleton } from '../utils'
import mdcTMLanguage from './languages/mdc.tmLanguage'
import type { MarkdownNode, HighlighterOptions, Theme, HighlightThemedToken, HighlightThemedTokenLine, TokenColorMap } from './types'

// Re-create logger locally as utils cannot be imported from here
const logger = consola.withScope('@nuxt/content')

/**
 * Resolve Shiki compatible lang from string.
 *
 * Used to resolve lang from both languages id's and aliases.
 */
const resolveLang = (lang: string) =>
  (BUNDLED_LANGUAGES.find(l => l.id === lang || l.aliases?.includes(lang)))

/**
 * Resolve Shiki compatible theme from string.
 */
const resolveTheme = (theme: string | Record<string, string>): Record<string, ShikiTheme> | undefined => {
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
  }, {} as Record<string, ShikiTheme>)
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
          'vue',
          {
            id: 'md',
            scopeName: 'text.markdown.mdc',
            path: 'mdc.tmLanguage.json',
            aliases: ['markdown', 'md', 'mdc'],
            grammar: mdcTMLanguage
          }
        ] as any[]
      }).then((highlighter) => {
        // Load all themes on-demand
        const themes = Object.values(typeof theme === 'string' ? { default: theme } : (theme || {}))

        if (themes.length) {
          return Promise
            .all(themes.map(theme => highlighter.loadTheme(theme)))
            .then(() => highlighter)
        }
        return highlighter
      })
    }
    return promise
  }

  const getHighlightedTokens = async (code: string, lang: Lang, theme: Theme) => {
    const highlighter = await getShikiHighlighter()
    // Remove trailing carriage returns
    code = code.replace(/\n+$/, '')
    // Resolve lang & theme (i.e check if shiki supports them)
    lang = (resolveLang(lang || '')?.id || lang) as Lang
    theme = resolveTheme(theme || '') || { default: highlighter.getTheme() as any as ShikiTheme }

    // Skip highlight if lang is not supported
    if (!lang) {
      return [[{ content: code }]]
    }

    // Load supported language on-demand
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      const languageRegistration = resolveLang(lang)

      if (languageRegistration) {
        await highlighter.loadLanguage(languageRegistration)
      } else {
        logger.warn(`Language '${lang}' is not supported by shiki. Skipping highlight.`)
        return [[{ content: code }]]
      }
    }

    // Load supported theme on-demand
    const newThemes = Object.values(theme).filter(t => !highlighter.getLoadedThemes().includes(t))
    if (newThemes.length) {
      await Promise.all(newThemes.map(highlighter.loadTheme))
    }

    // Highlight code
    const coloredTokens = Object.entries(theme).map(([key, theme]) => {
      const tokens = highlighter.codeToThemedTokens(code, lang, theme, { includeExplanation: false })
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

  const getHighlightedAST = async (code: string, lang: Lang, theme: Theme, opts?: Partial<HighlighterOptions>): Promise<Array<MarkdownNode>> => {
    const lines = await getHighlightedTokens(code, lang, theme)
    const { highlights = [], colorMap = {} } = opts || {}

    return lines.map((line, lineIndex) => ({
      type: 'element',
      tag: 'div',
      props: { class: ['line', highlights.includes(lineIndex + 1) ? 'highlight' : ''].join(' ').trim() },
      children: line.map(tokenSpan)
    }))

    function getColorProps (token: { color?: string | object }) {
      if (!token.color) {
        return {}
      }
      if (typeof token.color === 'string') {
        return { style: { color: token.color } }
      }
      const key = Object.values(token.color).join('')
      if (!colorMap[key]) {
        colorMap[key] = {
          colors: token.color,
          className: 'ct-' + Math.random().toString(16).substring(2, 8) // hash(key)
        }
      }
      return { class: colorMap[key].className }
    }

    function tokenSpan (token: { content: string, color?: string | object }) {
      return {
        type: 'element',
        tag: 'span',
        props: getColorProps(token),
        children: [{ type: 'text', value: token.content }]
      }
    }
  }

  const getHighlightedCode = async (code: string, lang: Lang, theme: Theme, opts?: Partial<HighlighterOptions>) => {
    const colorMap = opts?.colorMap || {}
    const highlights = opts?.highlights || []
    const ast = await getHighlightedAST(code, lang, theme, { colorMap, highlights })

    function renderNode (node: any) {
      if (node.type === 'text') {
        return node.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }
      const children = node.children.map(renderNode).join('')
      return `<${node.tag} class="${node.props.class}">${children}</${node.tag}>`
    }

    return {
      code: ast.map(renderNode).join(''),
      styles: generateStyles(colorMap)
    }
  }

  const generateStyles = (colorMap: TokenColorMap) => {
    const colors: string[] = []
    for (const colorClass of Object.values(colorMap)) {
      Object.entries(colorClass.colors).forEach(([variant, color]) => {
        if (variant === 'default') {
          colors.unshift(`.${colorClass.className}{color:${color}}`)
        } else {
          colors.push(`.${variant} .${colorClass.className}{color:${color}}`)
        }
      })
    }
    return colors.join('\n')
  }

  return {
    getHighlightedTokens,
    getHighlightedAST,
    getHighlightedCode,
    generateStyles
  }
})

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
