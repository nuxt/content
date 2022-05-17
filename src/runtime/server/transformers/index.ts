import { extname } from 'pathe'
import type { ParsedContent, ContentTransformer } from '../../types'
import { getParser, getTransformers } from '#content/virtual/transformers'

/**
 * Parse content file using registered plugins
 */
export async function parseContent (id: string, content: string) {
  const ext = extname(id)
  const plugin: ContentTransformer = getParser(ext)
  if (!plugin) {
    throw new Error(`No parser found for ${ext}`)
  }

  const parsed: ParsedContent = await plugin.parse!(id, content)

  const transformers = getTransformers(ext)
  const result = await transformers.reduce(async (prev, cur) => {
    const next = (await prev) || parsed

    return cur.transform!(next)
  }, Promise.resolve(parsed))

  return result
}
