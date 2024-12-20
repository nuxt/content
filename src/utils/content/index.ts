import { dirname } from 'node:path'
import { createShikiHighlighter, rehypeHighlight } from '@nuxtjs/mdc/runtime'
import { hash } from 'ohash'
import type { Highlighter, MdcConfig, ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import type { Nuxt } from '@nuxt/schema'
import { defu } from 'defu'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { visit } from 'unist-util-visit'
import type {
  ResolvedCollection,
} from '../../types/collection'
import type { FileAfterParseHook, FileBeforeParseHook, ModuleOptions } from '../../types/module'
import { transformContent } from './transformers'
import type { ContentFile } from '~/src/types'

let parserOptions = {
  mdcConfigs: [] as MdcConfig[],
}
export function setParserOptions(opts: Partial<typeof parserOptions>) {
  parserOptions = defu(opts, parserOptions)
}

type HighlighterOptions = Exclude<MDCModuleOptions['highlight'], false | undefined> & { compress: boolean }
type HighlightedNode = { type: 'element', properties?: Record<string, string | undefined> }

let highlightPlugin: {
  instance: unknown
  key?: string
  options?: {
    theme?: Record<string, unknown>
    highlighter: Highlighter
  }

}
let highlightPluginPromise: Promise<typeof highlightPlugin>
async function getHighlightPluginInstance(options: HighlighterOptions) {
  if (!highlightPlugin) {
    highlightPluginPromise = highlightPluginPromise || _getHighlightPlugin(options)
    await highlightPluginPromise
  }

  return highlightPlugin
}
async function _getHighlightPlugin(options: HighlighterOptions) {
  const key = hash(JSON.stringify(options || {}))
  if (!highlightPlugin || highlightPlugin.key !== key) {
    const langs = Array.from(new Set(['bash', 'html', 'mdc', 'vue', 'yml', 'scss', 'ts', 'ts', 'typescript', ...(options.langs || [])]))
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
      options: {
        highlighter: async (code, lang, theme, opts) => {
          const result = await highlighter(code, lang, theme, opts)
          const visitTree = {
            type: 'element',
            children: result.tree as Array<unknown>,
          }
          if (options.compress) {
            const stylesMap: Record<string, string> = {}
            visit(
              visitTree,
              node => !!(node as HighlightedNode).properties?.style,
              (_node) => {
                const node = _node as HighlightedNode
                const style = node.properties!.style!
                stylesMap[style] = stylesMap[style] || 's' + hash(style).substring(0, 4)
                node.properties!.class = `${node.properties!.class || ''} ${stylesMap[style]}`.trim()
                node.properties!.style = undefined
              },
            )

            result.style = Object.entries(stylesMap).map(([style, cls]) => `html pre.shiki code .${cls}, html code.shiki .${cls}{${style}}`).join('') + result.style
          }

          return result
        },
        theme: Object.fromEntries(bundledThemes),
      },
    }
  }
  return highlightPlugin
}

export async function createParser(collection: ResolvedCollection, nuxt?: Nuxt) {
  const mdcOptions = (nuxt?.options as unknown as { mdc: MDCModuleOptions })?.mdc || {}
  const { pathMeta = {}, markdown = {} } = (nuxt?.options as unknown as { content: ModuleOptions })?.content?.build || {}

  const rehypeHighlightPlugin = markdown.highlight !== false
    ? await getHighlightPluginInstance(defu(markdown.highlight as HighlighterOptions, mdcOptions.highlight, { compress: true }))
    : undefined

  const parserOptions = {
    pathMeta: pathMeta,
    markdown: {
      compress: true,
      ...mdcOptions,
      ...markdown,
      rehypePlugins: {
        highlight: rehypeHighlightPlugin,
        ...mdcOptions?.rehypePlugins,
        ...markdown?.rehypePlugins,
      },
      remarkPlugins: {
        'remark-emoji': {},
        ...mdcOptions?.remarkPlugins,
        ...markdown?.remarkPlugins,
      },
      highlight: undefined as HighlighterOptions,
    },
  }

  return async function parse(file: ContentFile) {
    if (file.path && !file.dirname) {
      file.dirname = dirname(file.path)
    }
    const beforeParseCtx: FileBeforeParseHook = { file, collection, parserOptions }
    // @ts-expect-error runtime type
    await nuxt?.callHook?.('content:file:beforeParse', beforeParseCtx)
    const { file: hookedFile, collection: hookedCollection } = beforeParseCtx

    const parsedContent = await transformContent(hookedFile, beforeParseCtx.parserOptions)
    const { id: id, ...parsedContentFields } = parsedContent
    const result = { id } as typeof collection.extendedSchema._type
    const meta = {} as Record<string, unknown>

    const collectionKeys = Object.keys(hookedCollection.extendedSchema.shape)
    for (const key of Object.keys(parsedContentFields)) {
      if (collectionKeys.includes(key)) {
        result[key] = parsedContent[key]
      }
      else {
        meta[key] = parsedContent[key]
      }
    }

    result.meta = meta

    // Storing `content` into `rawbody` field
    if (collectionKeys.includes('rawbody')) {
      result.rawbody = result.rawbody ?? file.body
    }

    if (collectionKeys.includes('seo')) {
      result.seo = result.seo || {}
      result.seo.title = result.seo.title || result.title
      result.seo.description = result.seo.description || result.description
    }

    const afterParseCtx: FileAfterParseHook = { file: hookedFile, content: result, collection }
    // @ts-expect-error runtime type
    await nuxt?.callHook?.('content:file:afterParse', afterParseCtx)
    return afterParseCtx.content
  }
}
