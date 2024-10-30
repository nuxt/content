import { createShikiHighlighter, rehypeHighlight } from '@nuxtjs/mdc/runtime'
import { hash } from 'ohash'
import type { Highlighter, MdcConfig, ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import type { Nuxt } from '@nuxt/schema'
import { defu } from 'defu'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import type { ResolvedCollection } from '../../types/collection'
import { transformContent } from './transformers'

let parserOptions = {
  mdcConfigs: [] as MdcConfig[],
}
export function setParserOptions(opts: Partial<typeof parserOptions>) {
  parserOptions = defu(opts, parserOptions)
}

type HighlighterOptions = Exclude<MDCModuleOptions['highlight'], false | undefined>

let highlightPlugin: {
  instance: unknown
  key?: string
  theme?: Record<string, unknown>
  highlighter: Highlighter
}
let highlightPluginPromise: Promise<typeof highlightPlugin>
async function getHighlighPluginInstance(options: HighlighterOptions) {
  if (!highlightPlugin) {
    highlightPluginPromise = highlightPluginPromise || _getHighlighPlugin(options)
    await highlightPluginPromise
  }

  return highlightPlugin
}
async function _getHighlighPlugin(options: HighlighterOptions) {
  const key = hash(JSON.stringify(options || {}))
  if (!highlightPlugin || highlightPlugin.key !== key) {
    const langs = Array.from(new Set(['bash', 'html', 'mdc', 'vue', 'yml', 'scss', 'ts', 'ts', ...(options.langs || [])]))
    const themesObject = typeof options.theme === 'string' ? { default: options.theme } : options.theme || { default: 'material-theme-palenight' }
    const bundledThemes = await Promise.all(Object.entries(themesObject)
      .map(async ([name, theme]) => [
        name,
        typeof theme === 'string' ? (await import(`shiki/themes/${theme}.mjs`).then(m => m.default || m)) : theme,
      ]))
    const bundledLangs = await Promise.all(langs.map(async lang => [
      lang,
      await import(`shiki/langs/${lang}.mjs`).then(m => m.default || m),
    ]))

    const highlighter = createShikiHighlighter({
      bundledThemes: Object.fromEntries(bundledThemes),
      // Configure the bundled languages
      bundledLangs: Object.fromEntries(bundledLangs),
      engine: createOnigurumaEngine(import('shiki/wasm')),
      getMdcConfigs: () => Promise.resolve(parserOptions.mdcConfigs),
    })

    highlightPlugin = {
      key,
      instance: rehypeHighlight,
      ...options,
      highlighter,
      theme: Object.fromEntries(bundledThemes),
    }
  }
  return highlightPlugin
}

export async function parseContent(key: string, content: string, collection: ResolvedCollection, nuxt?: Nuxt) {
  const markdownOptions = (nuxt?.options as unknown as { mdc: MDCModuleOptions })?.mdc || {}
  const parsedContent = await transformContent(key, content, {
    markdown: {
      compress: true,
      ...markdownOptions,
      rehypePlugins: {
        highlight: markdownOptions.highlight === false
          ? undefined
          : await getHighlighPluginInstance(markdownOptions.highlight || {}),
        ...markdownOptions?.rehypePlugins,
      },
      highlight: undefined,
    },
  })

  const { id: _id, ...parsedContentFields } = parsedContent
  const result = { _id } as typeof collection.schema._type
  const meta = {} as Record<string, unknown>

  const collectionKeys = Object.keys(collection.extendedSchema.shape)
  for (const key of Object.keys(parsedContentFields)) {
    if (collectionKeys.includes(key)) {
      result[key] = parsedContent[key]
    }
    else {
      meta[key] = parsedContent[key]
    }
  }

  result.meta = meta

  return result
}
