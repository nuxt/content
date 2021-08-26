import markdown from './markdown'
import json from './json'

const transformers: { [key: string]: (id: string, body: string) => any } = {
  default: (_id = '', body = '') => ({ body, meta: {} }),
  '.md': markdown,
  '.json': json
}

const exts = Object.keys(transformers)

export function getTransformer(id: string) {
  return transformers[exts.find(ext => id.endsWith(ext)) || 'default']
}
