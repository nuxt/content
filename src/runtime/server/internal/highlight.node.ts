import { createHighlightPlugin } from './highlight'

// `#content/highlight` inside the module process (the dev surface is imported
// through jiti), where any bundled Shiki theme/language can be loaded by name.
// Nitro resolves `#content/highlight` to a generated template instead.
const config = import.meta.content.highlight

type Shiki = typeof import('shiki')
const loadTheme = (name: string) => () => import('shiki').then((shiki: Shiki) => shiki.bundledThemes[name as keyof Shiki['bundledThemes']]())
const loadLang = (name: string) => () => import('shiki').then((shiki: Shiki) => shiki.bundledLanguages[name as keyof Shiki['bundledLanguages']]())

export const highlight = config
  ? createHighlightPlugin({
      themes: {
        light: config.themes.light ? loadTheme(config.themes.light) : undefined,
        dark: config.themes.dark ? loadTheme(config.themes.dark) : undefined,
      },
      langs: config.langs.map(loadLang),
    })
  : undefined
