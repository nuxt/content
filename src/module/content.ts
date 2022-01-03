import { addServerMiddleware, resolveModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { resolve } from 'pathe'
import { runtimeDir } from '../dirs'
import { setupContentDevModule } from './content.dev'

export type MountOptions = {
  driver: 'fs' | 'http' | 'memory' | string
  driverOptions?: Record<string, any>
}

/**
 * Generate mounts for content storages
 */
export function useContentMounts(nuxt: Nuxt, storages: Array<string | (MountOptions & { base: string })>) {
  const key = (path: string) => `docus:source:${path.replace(/[/:]/g, '_')}`

  return storages.reduce((mounts, storage) => {
    if (typeof storage === 'string') {
      mounts[key(storage)] = {
        driver: 'fs',
        driverOptions: {
          base: resolve(nuxt.options.rootDir, storage)
        }
      }
    }

    if (typeof storage === 'object') {
      mounts[key(storage.base)] = {
        driver: storage.driver,
        driverOptions: storage.driverOptions
      }
    }

    return mounts
  }, {} as Record<string, MountOptions>)
}

export function setupContentModule(options: any, nuxt: Nuxt) {
  nuxt.hook('nitro:context', ctx => {
    const mounts = useContentMounts(nuxt, options.sources)
    Object.assign(ctx.storage.mounts, mounts)
  })

  // Add server routes for each content functions
  for (const api of ['list', 'get']) {
    addServerMiddleware({
      route: `/api/_docus/${api}`,
      handle: resolveModule(`./server/api/${api}`, { paths: runtimeDir })
    })
  }

  // Setup content dev module
  if (nuxt.options.dev) {
    setupContentDevModule(options, nuxt)
  }
}
