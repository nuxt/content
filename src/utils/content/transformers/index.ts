import { extname } from 'pathe'
import { camelCase } from 'scule'
import type { ContentTransformer, TransformContentOptions, ContentFile } from '../../../types/content'
import csv from './csv'
import markdown from './markdown'
import yaml from './yaml'
import json from './json'

const TRANSFORMERS = [
  csv,
  markdown,
  json,
  yaml,
]

function getParser(ext: string, additionalTransformers: ContentTransformer[] = []): ContentTransformer | undefined {
  let parser = additionalTransformers.find(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.parse)
  if (!parser) {
    parser = TRANSFORMERS.find(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.parse)
  }

  return parser
}

function getTransformers(ext: string, additionalTransformers: ContentTransformer[] = []) {
  return [
    ...additionalTransformers.filter(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.transform),
    ...TRANSFORMERS.filter(p => ext.match(new RegExp(p.extensions.join('|'), 'i')) && p.transform),
  ]
}

/**
 * Parse content file using registered plugins
 */
export async function transformContent(file: ContentFile, options: TransformContentOptions = {}) {
  const { transformers = [] } = options
  // Call hook before parsing the file

  const ext = file.extension || extname(file.id)
  const parser = getParser(ext, transformers)
  if (!parser) {
    throw new Error(`\`${ext}\` files are not supported.`)
  }

  const parserOptions = (options[camelCase(parser.name)] || {}) as Record<string, unknown>
  const parsed = await parser.parse!(file, parserOptions)

  const matchedTransformers = getTransformers(ext, transformers)
  const result = await matchedTransformers.reduce(async (prev, cur) => {
    const next = (await prev) || parsed

    const transformOptions = options[camelCase(cur.name)]

    // disable transformer if options is false
    if (transformOptions === false) {
      return next
    }

    return cur.transform!(next, (transformOptions || {}) as Record<string, unknown>)
  }, Promise.resolve(parsed))

  return result
}

export { defineTransformer } from './utils'
