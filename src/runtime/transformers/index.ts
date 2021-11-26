import json from './json'
import { getPathMeta } from './utils'
import markdown from '#docus/markdown'
import privateConfig from '#config'

type TransformerResult = { meta: any; body: any }
type Transformer = (id: string, body: string) => Promise<TransformerResult> | TransformerResult

// extract meta information from path and merge with transformer meta
const withPathMeta = (transformer: Transformer): Transformer => {
  return async (id: string, body: string) => {
    const result = await transformer(id, body)
    // Calculate meta information based on file path
    const pathMeta = getPathMeta(id, {
      locales: privateConfig.docus.locales.codes,
      defaultLocale: privateConfig.docus.locales.defaultLocale
    })

    result.meta = {
      ...pathMeta,
      ...result.meta
    }
    return result
  }
}

// Available transformers: JSON, Markdown
const transformers: { [key: string]: Transformer } = {
  default: withPathMeta((_id = '', body = '') => Promise.resolve({ body, meta: {} })),
  '.md': withPathMeta(markdown),
  '.json': withPathMeta(json)
}

// Supported extensions
const exts = Object.keys(transformers)

// Get the transformer for a specific extension
export function getTransformer(id: string) {
  return transformers[exts.find(ext => id.endsWith(ext)) || 'default']
}
