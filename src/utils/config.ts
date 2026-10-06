import type { AnyComarkContent, ContentHub } from 'comark-content'
import { createJiti } from 'jiti'

function createContentJiti(rootDir: string) {
  const babelJiti = createJiti(import.meta.url)
  return createJiti(import.meta.url, {
    tryNative: false,
    moduleCache: false,
    fsCache: false,
    transform: (opts) => {
      const source = opts.source.replace(/import\.meta\.rootDir/g, JSON.stringify(rootDir))
      return { code: babelJiti.transform({ ...opts, source }) }
    },
  })
}

export type ImportedContent = {
  /** Exported surface — a single instance or a hub. */
  cms: AnyComarkContent | ContentHub
}

export async function importCMS(rootDir: string, filename: string): Promise<ImportedContent> {
  const jiti = createContentJiti(rootDir)
  const mod = await jiti.import(filename) as Record<string, unknown>

  // Prefer a dedicated export, then common aliases.
  const cms = (mod.cms ?? mod.content ?? mod.default ?? mod.hub) as ImportedContent['cms'] | undefined
  if (!cms || typeof cms !== 'object') {
    throw new Error(`No content export found in ${filename}. Export \`cms\` (or \`content\`) from your server content file.`)
  }
  return { cms }
}
