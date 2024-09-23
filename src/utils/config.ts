import { join } from 'node:path'
import type { Nuxt } from '@nuxt/schema'
import fastGlob from 'fast-glob'
import { resolveCollections } from './collection'
import { generateInitialFiles } from './dev'

export async function loadContentConfig(nuxt: Nuxt, opts: { createOnMissing?: boolean } = {}) {
  const configs = await fastGlob('content.config.*', { cwd: nuxt.options.rootDir })
  let configPath = configs.length ? join(nuxt.options.rootDir, configs[0]) : undefined

  if (!configPath && opts?.createOnMissing) {
    configPath = await generateInitialFiles(nuxt)
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
