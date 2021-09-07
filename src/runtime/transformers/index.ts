import markdown from './markdown'
import json from './json'

// Available transformers: JSON, Markdown
const transformers: { [key: string]: (id: string, body: string) => any } = {
  default: (_id = '', body = '') => ({ body, meta: {} }),
  '.md': markdown,
  '.json': json
}

// Supported extensions
const exts = Object.keys(transformers)

// Get the transformer for a specific extension
export function getTransformer(id: string) {
  return transformers[exts.find(ext => id.endsWith(ext)) || 'default']
}
