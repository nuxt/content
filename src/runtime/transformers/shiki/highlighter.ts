import { getHighlighter, BUNDLED_LANGUAGES, BUNDLED_THEMES, Lang, Theme as ShikiTheme, Highlighter, FontStyle } from 'shiki-es'
import { consola } from 'consola'
import type { ModuleOptions } from '../../../module'
import { createSingleton } from '../utils'
import mdcTMLanguage from './languages/mdc.tmLanguage'
import type { MarkdownNode, HighlighterOptions, Theme, HighlightThemedToken, HighlightThemedTokenLine, TokenStyleMap, HighlightThemedTokenStyle } from './types'

// Re-create logger locally as utils cannot be imported from here
const logger = consola.withTag('@nuxt/content')

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

  const splitCodeToLines = (code: string) => {
    const lines = code.split(/\r\n|\r|\n/)
    return [...lines.map((line: string) => [{ content: line }])]
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
      return splitCodeToLines(code)
    }

    // Load supported language on-demand
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      const languageRegistration = resolveLang(lang)

      if (languageRegistration) {
        await highlighter.loadLanguage(languageRegistration)
      } else {
        logger.warn(`Language '${lang}' is not supported by shiki. Skipping highlight.`)
        return splitCodeToLines(code)
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
        .map(line => line.map(token => ({
          content: token.content,
          style: {
            [key]: {
              color: token.color,
              fontStyle: token.fontStyle
            }
          }
        })))
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
    const { highlights = [], styleMap = {} } = opts || {}

    return lines.map((line, lineIndex) => {
      // Add line break to all lines except last
      if (lineIndex !== lines.length - 1) {
        // Add line break to empty lines
        if (line.length === 0) {
          line.push({ content: '' })
        }
        line[line.length - 1].content += '\n'
      }

      return {
        type: 'element',
        tag: 'span',
        props: {
          class: ['line', highlights.includes(lineIndex + 1) ? 'highlight' : ''].join(' ').trim(),
          line: lineIndex + 1
        },
        children: line.map(tokenSpan)
      }
    })

    function getSpanProps (token: HighlightThemedToken) {
      if (!token.style) {
        return {}
      }
      // TODO: generate unique key for style
      // Or simply using `JSON.stringify(token.style)` would be easier to understand,
      // but not sure about the impact on performance
      const key = Object.values(token.style).map(themeStyle => Object.values(themeStyle).join('')).join('')
      if (!styleMap[key]) {
        styleMap[key] = {
          style: token.style,
          // Using the hash value of the style as the className,
          // ensure that the className remains stable over multiple compilations,
          // which facilitates content caching.
          className: 'ct-' + hash(key)
        }
      }
      return { class: styleMap[key].className }
    }

    function tokenSpan (token: HighlightThemedToken) {
      return {
        type: 'element',
        tag: 'span',
        props: getSpanProps(token),
        children: [{ type: 'text', value: token.content }]
      }
    }
  }

  const getHighlightedCode = async (code: string, lang: Lang, theme: Theme, opts?: Partial<HighlighterOptions>) => {
    const styleMap = opts?.styleMap || {}
    const highlights = opts?.highlights || []
    const ast = await getHighlightedAST(code, lang, theme, { styleMap, highlights })

    function renderNode (node: any) {
      if (node.type === 'text') {
        return node.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }
      const children = node.children.map(renderNode).join('')
      return `<${node.tag} class="${node.props.class}">${children}</${node.tag}>`
    }

    return {
      code: ast.map(renderNode).join(''),
      styles: generateStyles(styleMap)
    }
  }

  const generateStyles = (styleMap: TokenStyleMap) => {
    const styles: string[] = []
    for (const styleToken of Object.values(styleMap)) {
      const defaultStyle = styleToken.style.default
      const hasColor = !!defaultStyle?.color
      const hasBold = isBold(defaultStyle)
      const hasItalic = isItalic(defaultStyle)
      const hasUnderline = isUnderline(defaultStyle)
      const themeStyles = Object.entries(styleToken.style).map(([variant, style]) => {
        const styleText = [
          // If the default theme has a style, but the current theme does not have one,
          // we need to override to reset style
          ['color', style.color || (hasColor ? 'unset' : '')],
          ['font-weight', isBold(style) ? 'bold' : hasBold ? 'unset' : ''],
          ['font-style', isItalic(style) ? 'italic' : hasItalic ? 'unset' : ''],
          ['text-decoration', isUnderline(style) ? 'bold' : hasUnderline ? 'unset' : '']
        ]
          .filter(kv => kv[1])
          .map(kv => kv.join(':') + ';')
          .join('')
        return { variant, styleText }
      })

      const defaultThemeStyle = themeStyles.find(themeStyle => themeStyle.variant === 'default')
      themeStyles.forEach((themeStyle) => {
        if (themeStyle.variant === 'default') {
          styles.push(`.${styleToken.className}{${themeStyle.styleText}}`)
        } else if (themeStyle.styleText !== defaultThemeStyle?.styleText) {
          // Skip if same as default theme
          styles.push(`.${themeStyle.variant} .${styleToken.className}{${themeStyle.styleText}}`)
        }
      })
    }
    return styles.join('\n')
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
        style: {
          ...right.tokens[index].style,
          ...left.tokens[index].style
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

function isBold (style?: HighlightThemedTokenStyle) {
  return style && style.fontStyle === FontStyle.Bold
}

function isItalic (style?: HighlightThemedTokenStyle) {
  return style && style.fontStyle === FontStyle.Italic
}

function isUnderline (style?: HighlightThemedTokenStyle) {
  return style && style.fontStyle === FontStyle.Underline
}

/**
 * An insecure but simple and fast hash method.
 * https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0?permalink_comment_id=4261728#gistcomment-4261728
 */
function hash (str: string) {
  return Array.from(str)
    .reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)
    .toString()
    .slice(-6)
}
