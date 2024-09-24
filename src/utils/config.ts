import { join } from 'node:path'
import fastGlob from 'fast-glob'
import { resolveCollections } from './collection'
import { generateInitialFiles } from './dev'

export async function loadContentConfig(root: string, opts: { createOnMissing?: boolean } = {}) {
  const configs = await fastGlob('content.config.*', { cwd: root })
  let configPath = configs.length ? join(root, configs[0]) : undefined

  if (!configPath && opts?.createOnMissing) {
    configPath = await generateInitialFiles(root)
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
