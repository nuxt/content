import { createShikiHighlighter, rehypeHighlight } from '@nuxtjs/mdc/runtime'
import MaterialThemePalenight from 'shiki/themes/material-theme-palenight.mjs'
import HtmlLang from 'shiki/langs/html.mjs'
import MdcLang from 'shiki/langs/mdc.mjs'
import TsLang from 'shiki/langs/typescript.mjs'
import VueLang from 'shiki/langs/vue.mjs'
import ScssLang from 'shiki/langs/scss.mjs'
import YamlLang from 'shiki/langs/yaml.mjs'
import type { ResolvedCollection } from '../../types/collection'
import { transformContent } from './transformers'

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
export async function parseContent(key: string, content: string, collection: ResolvedCollection) {
  const parsedContent = await transformContent(key, content, {
    markdown: {
      rehypePlugins: { highlight: highlightPlugin },
    },
  })

  const result = { contentId: parsedContent.id } as Record<string, unknown>
  const meta = {} as Record<string, unknown>

  const collectionKeys = Object.keys(collection.extendedSchema.shape)
  for (const key of Object.keys(parsedContent)) {
    if (collectionKeys.includes(key)) {
      result[key] = parsedContent[key]
    }
    else {
      meta[key] = parsedContent[key]
    }
  }

  result.meta = meta

  result.weight = String(result.stem || '')
    .split('/')
    .map(f => (f.match(/^(\d+)\./)?.[1] ?? '999').padStart(3, '9'))
    .join('')
    .padEnd(12, '9')
    .slice(0, 12)

  return result
}
