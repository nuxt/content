import { dirname } from 'node:path'
import { createShikiHighlighter, rehypeHighlight } from '@nuxtjs/mdc/runtime'
import { hash } from 'ohash'
import type { Highlighter, MdcConfig, ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import type { Nuxt } from '@nuxt/schema'
import { resolveAlias } from '@nuxt/kit'
import type { LanguageRegistration } from 'shiki'
import { defu } from 'defu'
import { createJiti } from 'jiti'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { visit } from 'unist-util-visit'
import type { ResolvedCollection } from '../../types/collection'
import type { FileAfterParseHook, FileBeforeParseHook, ModuleOptions, ContentFile, ContentTransformer, ParsedContentFile } from '../../types'
import { logger } from '../dev'
import { getOrderedSchemaKeys } from '../../runtime/internal/schema'
import { transformContent } from './transformers'
import pathMetaTransformer from './transformers/path-meta'

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
} | undefined
let highlightPluginPromise: Promise<typeof highlightPlugin> | undefined
async function getHighlightPluginInstance(options: HighlighterOptions) {
  const key = hash(JSON.stringify(options || {}))

  // If the key is different, reset the plugin
  if (highlightPlugin && highlightPlugin.key !== key) {
    highlightPlugin = undefined
    highlightPluginPromise = undefined
  }

  // If the plugin is not initialized, initialize it
  if (!highlightPlugin) {
    highlightPluginPromise = highlightPluginPromise || _getHighlightPlugin(key, options)
    await highlightPluginPromise
  }

  return highlightPlugin
}
async function _getHighlightPlugin(key: string, options: HighlighterOptions) {
  const langs = Array.from(new Set(['bash', 'html', 'mdc', 'vue', 'yml', 'scss', 'ts', 'typescript', ...(options.langs || [])]))
  const themesObject = typeof options.theme === 'string' ? { default: options.theme } : options.theme || { default: 'material-theme-palenight' }
  const bundledThemes = await Promise.all(Object.entries(themesObject)
    .map(async ([name, theme]) => [
      name,
      typeof theme === 'string' ? (await import(`shiki/themes/${theme}.mjs`).then(m => m.default || m)) : theme,
    ]))
  const bundledLangs = await Promise.all(langs.map(async lang => [
    typeof lang === 'string' ? lang : (lang as unknown as LanguageRegistration).name,
    typeof lang === 'string' ? await import(`@shikijs/langs/${lang}`).then(m => m.default || m) : lang,
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
  return highlightPlugin
}

export async function createParser(collection: ResolvedCollection, nuxt?: Nuxt) {
  const nuxtOptions = nuxt?.options as unknown as { content: ModuleOptions, mdc: MDCModuleOptions }
  const mdcOptions = nuxtOptions?.mdc || {}
  const { pathMeta = {}, markdown = {}, transformers = [], csv = {}, yaml = {} } = nuxtOptions?.content?.build || {}

  const rehypeHighlightPlugin = markdown.highlight !== false
    ? await getHighlightPluginInstance(defu(markdown.highlight as HighlighterOptions, mdcOptions.highlight, { compress: true }))
    : undefined

  // Load transformers
  let extraTransformers: ContentTransformer[] = []
  if (nuxt?.options?.rootDir) {
    const jiti = createJiti(nuxt.options.rootDir)
    extraTransformers = await Promise.all(transformers.map(async (transformer) => {
      const resolved = resolveAlias(transformer, nuxt?.options?.alias)

      return jiti.import(resolved).then(m => (m as { default: ContentTransformer }).default || m).catch((e: unknown) => {
        logger.error(`Failed to load transformer ${transformer}`, e)
        return false
      })
    })).then(transformers => transformers.filter(Boolean)) as ContentTransformer[]
  }
  const parserOptions = {
    pathMeta: pathMeta,
    markdown: {
      compress: true,
      ...mdcOptions,
      ...markdown,
      rehypePlugins: {
        ...mdcOptions?.rehypePlugins,
        ...markdown?.rehypePlugins,
        // keep highlight plugin last to avoid conflict with other code plugins like `rehype-katex`
        highlight: rehypeHighlightPlugin,
      },
      remarkPlugins: {
        'remark-emoji': {},
        ...mdcOptions?.remarkPlugins,
        ...markdown?.remarkPlugins,
      },
      highlight: undefined,
    },
    csv: csv,
    yaml: yaml,
  }

  return async function parse(file: ContentFile) {
    if (file.path) {
      file.dirname = file.dirname ?? dirname(file.path)
      file.extension = file.extension ?? file.path.includes('.') ? '.' + file.path.split('.').pop() : undefined
    }
    // Replace all \r\n with \n to avoid hydration errors on Windows
    if (String(file.body).includes('\r\n')) {
      file.body = file.body.replace(/\r\n/g, '\n')
    }

    const beforeParseCtx: FileBeforeParseHook = { file, collection, parserOptions }
    await nuxt?.callHook?.('content:file:beforeParse', beforeParseCtx)
    const { file: hookedFile } = beforeParseCtx

    const parsedContent = await transformContent(hookedFile, {
      ...beforeParseCtx.parserOptions,
      transformers: extraTransformers,
      markdown: {
        ...beforeParseCtx.parserOptions?.markdown,
        contentHeading: !file?.collectionType || file?.collectionType === 'page',
      },
    })

    const collectionKeys = getOrderedSchemaKeys(collection.extendedSchema)

    const { id: id, __metadata, ...parsedContentFields } = parsedContent
    const result = { id } as ParsedContentFile
    const meta = {} as Record<string, unknown>

    for (const key of Object.keys(parsedContentFields)) {
      if (collectionKeys.includes(key)) {
        result[key] = parsedContent[key]
      }
      else {
        meta[key] = parsedContent[key]
      }
    }

    result.meta = meta

    result.__metadata = __metadata || {}

    // Storing `content` into `rawbody` field
    if (collectionKeys.includes('rawbody')) {
      result.rawbody = result.rawbody ?? file.body
    }

    if (collectionKeys.includes('seo')) {
      const seo = result.seo = (result.seo || {}) as Record<string, unknown>
      seo.title = seo.title || result.title
      seo.description = seo.description || result.description
    }

    const pathMetaFields = await pathMetaTransformer.transform!(parsedContent, {})
    const metaFields = ['path', 'title', 'stem', 'extension']
    for (const key of metaFields) {
      if (collectionKeys.includes(key) && result[key] === undefined) {
        result[key] = pathMetaFields[key]
      }
    }

    const afterParseCtx: FileAfterParseHook = { file: hookedFile, content: result as ParsedContentFile, collection }
    await nuxt?.callHook?.('content:file:afterParse', afterParseCtx)
    return afterParseCtx.content
  }
}
