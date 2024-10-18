import { createShikiHighlighter, rehypeHighlight } from '@nuxtjs/mdc/runtime'
import { hash } from 'ohash'
import type { Highlighter } from '@nuxtjs/mdc'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { ResolvedCollection } from '../../types/collection'
import type { ModuleOptions } from '../../types/module'
import { transformContent } from './transformers'

type HighlighterOptions = Exclude<ModuleOptions['build']['markdown']['highlight'], false | undefined>

let highlightPlugin: {
  instance: unknown
  key?: string
  theme?: Record<string, unknown>
  highlighter: Highlighter
}
async function getHighlighPlugin(options: HighlighterOptions) {
  const key = hash(JSON.stringify(options || {}))
  if (!highlightPlugin || highlightPlugin.key !== key) {
    const langs = Array.from(new Set(['html', 'mdc', 'vue', 'yml', 'scss', 'ts', 'ts', ...(options.langs || [])]))
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
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })

    highlightPlugin = {
      highlighter,
      key,
      instance: rehypeHighlight,
      ...options,
      theme: Object.fromEntries(bundledThemes),
    }
  }
  return highlightPlugin
}

export async function parseContent(key: string, content: string, collection: ResolvedCollection, options?: ModuleOptions['build']) {
  const parsedContent = await transformContent(key, content, {
    markdown: {
      compress: true,
      ...options?.markdown,
      rehypePlugins: {
        highlight: options?.markdown?.highlight === false
          ? undefined
          : await getHighlighPlugin(options?.markdown.highlight || {}),
        ...options?.markdown?.rehypePlugins,
      },
      highlight: undefined,
    },
  })

  const { id: contentId, ...parsedContentFields } = parsedContent
  const result = { contentId } as typeof collection.schema._type
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
