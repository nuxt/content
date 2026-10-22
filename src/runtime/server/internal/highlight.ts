import type { ComarkPlugin } from 'comark'
import type { ShikiOptions } from 'comark/plugins/shiki'

type Theme = NonNullable<NonNullable<ShikiOptions['themes']>['light']>
type Language = NonNullable<ShikiOptions['languages']>[number]
type Loader<T> = () => Promise<T | { default: T }>

export interface HighlightLoaders {
  themes: { light?: Loader<Theme>, dark?: Loader<Theme> }
  langs: Loader<Language>[]
}

async function load<T>(loader: Loader<T>): Promise<T> {
  const mod = await loader()
  return (mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod) as T
}

/**
 * Comark plugin highlighting code blocks with Shiki. `shiki`, themes and
 * languages are only loaded once a document with a code block is parsed.
 */
export function createHighlightPlugin(loaders: HighlightLoaders): ComarkPlugin {
  let setup: Promise<{ highlightCodeBlocks: typeof import('comark/plugins/shiki').highlightCodeBlocks, options: ShikiOptions }> | undefined

  const resolveSetup = async () => {
    const [{ highlightCodeBlocks }, light, dark, ...languages] = await Promise.all([
      import('comark/plugins/shiki'),
      loaders.themes.light ? load(loaders.themes.light) : undefined,
      loaders.themes.dark ? load(loaders.themes.dark) : undefined,
      ...loaders.langs.map(load),
    ])
    const options: ShikiOptions = {
      registerDefaultThemes: false,
      registerDefaultLanguages: false,
      themes: { light, dark },
      languages: languages as Language[],
    }
    return { highlightCodeBlocks, options }
  }

  return {
    name: 'shiki',
    async post(state) {
      setup ??= resolveSetup().catch((error) => {
        setup = undefined
        throw error
      })
      const { highlightCodeBlocks, options } = await setup
      state.tree = await highlightCodeBlocks(state.tree, options)
    },
  }
}
