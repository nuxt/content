import { join } from 'node:path'
import fastGlob from 'fast-glob'
import { createJiti } from 'jiti'
import type { DefinedCollection } from '../types'
import { resolveCollections } from './collection'
import { generateInitialFiles } from './dev'

export async function loadContentConfig(rootDir: string, opts: { createOnMissing?: boolean } = {}) {
  const jiti = createJiti(rootDir)
  const configs = await fastGlob('content.config.*', { cwd: rootDir })
  let configPath = configs.length ? join(rootDir, configs[0]) : undefined

  if (!configPath && opts?.createOnMissing) {
    configPath = await generateInitialFiles(rootDir)
  }

  const contentConfig = (configPath
    ? await jiti.import(configPath)
      .catch((err) => {
        console.error(err)
        return {}
      })
    : {}) as { collections: Record<string, DefinedCollection> }

  return {
    collections: resolveCollections(contentConfig.collections || {}, { rootDir }),
  }
}
