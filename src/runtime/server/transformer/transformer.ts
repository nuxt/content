import { extname } from 'pathe'
import type { ParsedContent, ContentPlugin } from '../../types'
// @ts-ignore
import { getParser, getTransformers } from '#content-plugins'

/**
 * Parse content file using registered plugins
 */
export function parse (id: string, content: string) {
  const ext = extname(id)
  const plugin = getParser(ext)
  if (!plugin) {
    throw new Error(`No parser found for ${ext}`)
  }

  return plugin.parse!(id, content)
}

/**
 * Transform parsed content.
 * Custom plugins can be registered to transform parsed content.
 */
export async function transform (content: ParsedContent) {
  const ext = extname(content.meta.id)
  const transformers = getTransformers(ext)

  const result = await transformers.reduce(async (prev: Promise<ParsedContent>, cur: ContentPlugin) => {
    const next = (await prev) || content

    return cur.transform!(next)
  }, Promise.resolve(content))

  return result
}
