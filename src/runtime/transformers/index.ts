import { extname } from 'pathe'
import { camelCase } from 'scule'
import type { StorageValue } from 'unstorage'
import type { ContentTransformer, TransformContentOptions } from '../types'
import csv from './csv'
import markdown from './markdown'
import yaml from './yaml'
import pathMeta from './path-meta'
import json from './json'

const TRANSFORMERS = [
  csv,
  markdown,
  json,
  yaml,
  pathMeta
]

function getParser (ext: string, additionalTransformers: ContentTransformer[] = []): ContentTransformer | undefined {
  let parser = additionalTransformers.find(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.parse)
  if (!parser) {
    parser = TRANSFORMERS.find(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.parse)
  }

  return parser
}

function getTransformers (ext: string, additionalTransformers: ContentTransformer[] = []) {
  return [
    ...additionalTransformers.filter(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.transform),
    ...TRANSFORMERS.filter(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.transform)
  ]
}

/**
 * Parse content file using registered plugins
 */
export async function transformContent (id: string, content: StorageValue, options: TransformContentOptions = {}) {
  const { transformers = [] } = options
  // Call hook before parsing the file
  const file = { _id: id, body: content }

  const ext = extname(id)
  const parser = getParser(ext, transformers)
  if (!parser) {
    // eslint-disable-next-line no-console
    console.warn(`${ext} files are not supported, "${id}" falling back to raw content`)
    return file
  }

  const parserOptions = options[camelCase(parser.name)] || {}
  const parsed = await parser.parse!(file._id, file.body, parserOptions)

  const matchedTransformers = getTransformers(ext, transformers)
  const result = await matchedTransformers.reduce(async (prev, cur) => {
    const next = (await prev) || parsed

    const transformOptions = options[camelCase(cur.name)]

    // disable transformer if options is false
    if (transformOptions === false) {
      return next
    }

    return cur.transform!(next, transformOptions || {})
  }, Promise.resolve(parsed))

  return result
}

export { defineTransformer } from './utils'
