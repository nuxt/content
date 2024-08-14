import type { createStorage } from 'unstorage'
import { transformContent } from '@nuxt/content/transformers'

import { createShikiHighlighter, rehypeHighlight } from '@nuxtjs/mdc/runtime'
import MaterialThemePalenight from 'shiki/themes/material-theme-palenight.mjs'
import HtmlLang from 'shiki/langs/html.mjs'
import MdcLang from 'shiki/langs/mdc.mjs'
import TsLang from 'shiki/langs/typescript.mjs'
import VueLang from 'shiki/langs/vue.mjs'
import ScssLang from 'shiki/langs/scss.mjs'
import YamlLang from 'shiki/langs/yaml.mjs'
import type { ResolvedCollection } from '../types/collection'

const highlightPlugin = {
  instance: rehypeHighlight,
  theme: 'material-theme-palenight',
  // Create the Shiki highlighter
  highlighter: createShikiHighlighter({
    bundledThemes: {
      'material-theme-palenight': MaterialThemePalenight,
    },
    // Configure the bundled languages
    bundledLangs: {
      html: HtmlLang,
      mdc: MdcLang,
      vue: VueLang,
      yml: YamlLang,
      scss: ScssLang,
      ts: TsLang,
      typescript: TsLang,
    },
  }),
}
export async function parseContent(storage: ReturnType<typeof createStorage>, collection: ResolvedCollection, key: string) {
  const content = await storage.getItem(key)
  const parsedContent = await transformContent(key, content, {
    markdown: {
      rehypePlugins: { highlight: highlightPlugin },
    },
  })

  // TODO: remove this
  const collectionKeys = Object.keys(collection.schema.shape)
  const result: Record<string, unknown> = {
    id: parsedContent._id || parsedContent.id || parsedContent.key,
    meta: {} as Record<string, unknown>,
  }
  collectionKeys.forEach((key) => {
    result[key] = parsedContent[key] || parsedContent[`_${key}`]
  })

  const metaObject = Object.keys(parsedContent).filter(key => !collectionKeys.includes(key)).map(key => ([key, parsedContent[key]]))

  result.meta = Object.fromEntries(metaObject)

  result.body = parsedContent.body || (parsedContent._extension === 'yml' ? JSON.parse(JSON.stringify(parsedContent)) : {})

  return result
}
