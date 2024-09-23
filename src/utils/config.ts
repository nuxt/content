import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import type { Nuxt } from '@nuxt/schema'
import fastGlob from 'fast-glob'
import { resolveCollections } from './collection'

export async function loadContentConfig(nuxt: Nuxt, opts: { createOnMissing?: boolean } = {}) {
  const configs = await fastGlob('content.config.*', { cwd: nuxt.options.rootDir })
  let configPath = configs.length ? join(nuxt.options.rootDir, configs[0]) : undefined
  if (!configPath && opts?.createOnMissing) {
    configPath = join(nuxt.options.rootDir, 'content.config.ts')
    await writeFile(
      configPath,
      [
        'import { defineCollection } from \'@farnabaz/content-next\'',
        '',
        'export const collections = {',
        '  pages: defineCollection({',
        '    type: \'page\',',
        '    source: \'pages/**\',',
        '  })',
        '}',
        '',
      ].join('\n'),
    )
  }

  const contentConfig = configPath
    ? await import(configPath)
      .catch((err) => {
        console.error(err)
        return []
      })
    : {}

  return {
    collections: resolveCollections(contentConfig.collections || {}),
  }
}
