import { extname } from 'pathe'
import pluginMarkdown from './plugin-markdown'
import pluginPathMeta from './plugin-path-meta'
import pluginYaml from './plugin-yaml'

const plugins: ContentPluginOptions[] = [pluginMarkdown, pluginPathMeta, pluginYaml]

/**
 * Parse content file using registered plugins
 */
export function parse(id: string, content: string) {
  const ext = extname(id)
  const plugin = plugins.find(p => p.extentions.includes(ext) && p.parse)
  if (!plugin) {
    throw new Error(`No parser found for ${ext}`)
  }

  return plugin.parse!(id, content)
}

/**
 * Transform parsed content.
 * Custom plugins can be registered to transform parsed content.
 */
export async function transform(content: ParsedContent) {
  const ext = extname(content.meta.id)
  const transformers = plugins.filter(p => ext.match(new RegExp(p.extentions.join('|'))) && p.transform)

  const result = await transformers.reduce(async (prev, cur) => {
    const next = (await prev) || content

    return cur.transform!(next)
  }, Promise.resolve(content))

  return result
}
