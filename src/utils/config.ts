import type { AnyComarkContent, ContentHub } from 'comark-content'
import { createJiti } from 'jiti'
import type { ResolvedContentCollections } from '../runtime/v3/content-config'

export type ImportContentOptions = {
  /** Collections resolved from the layers' v3 `content.config.ts` files. */
  collections?: ResolvedContentCollections
}

function createContentJiti(rootDir: string, options: ImportContentOptions) {
  const babelJiti = createJiti(import.meta.url)
  return createJiti(import.meta.url, {
    tryNative: false,
    moduleCache: false,
    fsCache: false,
    transform: (opts) => {
      const source = opts.source
        .replace(/import\.meta\.rootDir/g, JSON.stringify(rootDir))
        .replace(/import\.meta\.content\.collections/g, JSON.stringify(options.collections ?? {}))
      return { code: babelJiti.transform({ ...opts, source }) }
    },
  })
}

export type ImportedContent = {
  /** Exported surface — a single instance or a hub. */
  content: AnyComarkContent | ContentHub
}

export async function importContent(rootDir: string, filename: string, options: ImportContentOptions = {}): Promise<ImportedContent> {
  const jiti = createContentJiti(rootDir, options)
  const mod = await jiti.import(filename) as Record<string, unknown>

  // Prefer a dedicated export, then common aliases.
  const content = (mod.content ?? mod.default ?? mod.hub) as ImportedContent['content'] | undefined
  if (!content || typeof content !== 'object') {
    throw new Error(`No content export found in ${filename}. Export \`content\` from your server content file.`)
  }
  return { content }
}
