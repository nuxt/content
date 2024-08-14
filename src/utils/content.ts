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
  Object.keys(collection.schema.shape).forEach((key) => {
    parseContent[key] = parsedContent[key] || parsedContent._[key]
  })
  parsedContent.title = parsedContent.title || parsedContent._title
  parsedContent.description = parsedContent.description || parsedContent._description
  parsedContent.path = parsedContent.path || parsedContent._path
  parsedContent.stem = parsedContent.stem || parsedContent._stem
  parsedContent.body = parsedContent.body || (parsedContent._extension === 'yml' ? JSON.parse(JSON.stringify(parsedContent)) : {})

  return parsedContent
}
