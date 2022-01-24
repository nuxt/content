import { addServerMiddleware, addTemplate, resolveAlias, resolveModule, templateUtils } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { join, resolve } from 'pathe'
import defu from 'defu'
import { runtimeDir } from '../dirs'
import { setupContentDevModule } from './content.dev'
import { addContentPlugin } from './utils'

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
  // Pass content ignore patterns to runtimr config, Ignore patterns will use in storage layer
  nuxt.options.privateRuntimeConfig.docus.ignores = options.content.ignores

  nuxt.hook('nitro:context', ctx => {
    const mounts = useContentMounts(nuxt, options.content.sources)
    Object.assign(ctx.storage.mounts, mounts)
  })

  // Add server routes for each content functions
  for (const api of ['list', 'get', 'query']) {
    addServerMiddleware({
      route: `/api/_docus/${api}`,
      handle: resolveModule(`./server/api/${api}`, { paths: runtimeDir })
    })
  }

  addTemplate({
    filename: 'docus-content-plugins.mjs',
    write: true,
    getContents: () => {
      const plugins = (options.content.plugins || []).map((p: string) => resolveAlias(p, nuxt.options.alias))
      return `${templateUtils.importSources(plugins)}
        export const plugins = [${plugins.map(templateUtils.importName).join(', ')}];
        export const getParser = (ext) => plugins.find(p => p.extentions.includes(ext) && p.parse);
        export const getTransformers = (ext) => plugins.filter(p => ext.match(new RegExp(p.extentions.join('|'))) && p.transform);
        export default () => {};
      `
    }
  })

  nuxt.options.alias['#docus-content-plugins'] = join(nuxt.options.buildDir, 'docus-content-plugins')
  nuxt.hook('nitro:context', ctx => {
    ctx.alias['#docus-content-plugins'] = join(nuxt.options.buildDir, 'docus-content-plugins.mjs')

    // Inline content template in Nitro bundle
    ctx.externals = defu(ctx.externals, {
      inline: [ctx.alias['#docus-content-plugins']]
    })
  })

  // Register internal content plugins
  addContentPlugin(resolveModule('./server/transformer/plugin-markdown', { paths: runtimeDir }))
  addContentPlugin(resolveModule('./server/transformer/plugin-path-meta', { paths: runtimeDir }))
  addContentPlugin(resolveModule('./server/transformer/plugin-yaml', { paths: runtimeDir }))

  // Setup content dev module
  if (nuxt.options.dev) {
    setupContentDevModule(options, nuxt)
  }
}
