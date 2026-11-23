import { directoryToURL, ensureDependencyInstalled, importModule, useLogger } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'

/**
 * Nuxt Content v3 `content.build.markdown.highlight` options.
 * @see https://content.nuxt.com/docs/getting-started/configuration#highlight
 */
export interface HighlightOptions {
  /**
   * Theme name, or a map of themes keyed by color mode (`default`, `light`, `dark`).
   * @see https://shiki.style/themes
   * @default { default: 'github-light', dark: 'github-dark' }
   */
  theme?: string | Record<string, string>
  /**
   * Languages to load, on top of the defaults.
   * @see https://shiki.style/languages
   */
  langs?: string[]
  /** @deprecated v2 alias of `langs`. */
  preload?: string[]
}

/** Serializable highlight config exposed to the runtime as `import.meta.content.highlight`. */
export interface ResolvedHighlightOptions {
  themes: { light?: string, dark?: string }
  langs: string[]
}

// Languages Nuxt Content v3 (through `@nuxtjs/mdc`) loads by default.
const V3_DEFAULT_LANGS = ['js', 'jsx', 'json', 'ts', 'tsx', 'vue', 'css', 'html', 'bash', 'md', 'mdc', 'yaml']
const V3_DEFAULT_THEME: Record<string, string> = { default: 'github-light', dark: 'github-dark' }

const logger = useLogger('@nuxt/content')

/**
 * Normalize the v3 highlight config. Returns `false` when highlighting is not
 * configured, or when `shiki` (an optional peer dependency) isn't installed.
 */
export async function resolveHighlightOptions(
  highlight: HighlightOptions | boolean | undefined,
  nuxt: Nuxt,
): Promise<ResolvedHighlightOptions | false> {
  if (!highlight) return false

  // Check and import from the same dirs: under pnpm, a layer's `shiki` only resolves from its `modulesDir`.
  const installed = await ensureDependencyInstalled('shiki', {
    rootDir: nuxt.options.rootDir,
    searchPaths: nuxt.options.modulesDir,
    // Never prompt during `nuxi prepare` (commonly run from `postinstall`).
    prompt: nuxt.options._prepare ? false : undefined,
  })
  if (!installed) {
    logger.warn('`content.build.markdown.highlight` is configured but `shiki` is not installed: code blocks won\'t be highlighted. Install `shiki` in your project to enable highlighting.')
    return false
  }

  const options: HighlightOptions = highlight === true ? {} : highlight
  const theme = options.theme ?? V3_DEFAULT_THEME
  const requested = typeof theme === 'string'
    ? { light: theme }
    : { light: theme.light ?? theme.default, dark: theme.dark }

  if (typeof theme === 'object') {
    const ignored = Object.keys(theme).filter(key => !['default', 'light', 'dark'].includes(key))
    if (ignored.length) {
      logger.warn(`Only \`default\`, \`light\` and \`dark\` highlight themes are supported, ignoring ${formatList(ignored)}.`)
    }
  }

  const langs = [...new Set([...V3_DEFAULT_LANGS, ...(options.langs ?? []), ...(options.preload ?? [])])]

  // Unknown names would otherwise fail later, as unresolved imports in the Nitro build.
  const { bundledThemes, bundledLanguages } = await importModule<typeof import('shiki')>('shiki', {
    url: [nuxt.options.rootDir, ...nuxt.options.modulesDir].map(dir => directoryToURL(dir)),
  })
  const knownTheme = (name?: string) => {
    if (!name || name in bundledThemes) return name
    logger.warn(`Unknown highlight theme \`${name}\`. See https://shiki.style/themes for the available themes.`)
  }
  const themes = { light: knownTheme(requested.light), dark: knownTheme(requested.dark) }
  const unknownLangs = langs.filter(lang => !(lang in bundledLanguages))
  if (unknownLangs.length) {
    logger.warn(`Unknown highlight languages ${formatList(unknownLangs)}. See https://shiki.style/languages for the available languages.`)
  }

  return {
    themes,
    langs: langs.filter(lang => lang in bundledLanguages),
  }
}

/**
 * `#content/highlight` for Nitro: static imports of the configured themes and
 * languages only, so the server bundle doesn't ship every Shiki grammar.
 */
export function highlightTemplate(highlight: ResolvedHighlightOptions | false, pluginPath: string) {
  if (!highlight) return 'export const highlight = undefined\n'

  const theme = (name?: string) => name ? `() => import(${JSON.stringify(`shiki/dist/themes/${name}.mjs`)})` : 'undefined'
  const lang = (name: string) => `() => import(${JSON.stringify(`shiki/dist/langs/${name}.mjs`)})`

  return `import { createHighlightPlugin } from ${JSON.stringify(pluginPath)}

export const highlight = createHighlightPlugin({
  themes: {
    light: ${theme(highlight.themes.light)},
    dark: ${theme(highlight.themes.dark)},
  },
  langs: [
${highlight.langs.map(name => `    ${lang(name)},`).join('\n')}
  ],
})
`
}

/**
 * Shiki inlines only the light colors.
 * Font styles and dark colors are `--shiki-light-*` and `--shiki-dark*` variables, applied here as `@nuxtjs/mdc` did for Content v3.
 */
export function highlightStylesTemplate(highlight: ResolvedHighlightOptions) {
  const light = `.shiki span {
  font-style: var(--shiki-light-font-style);
  font-weight: var(--shiki-light-font-weight);
  text-decoration: var(--shiki-light-text-decoration);
}
`
  if (!highlight.themes.dark) return light

  return `${light}html.dark .shiki span {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
`
}

function formatList(values: string[]) {
  return values.map(value => `\`${value}\``).join(', ')
}
