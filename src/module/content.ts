import { resolveModule, addServerMiddleware, addPlugin } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/kit'
import type { NitroContext } from '@nuxt/nitro'
import { resolve } from 'pathe'
import { runtimeDir, templateDir } from '../dirs'
import { resolveApiRoute } from './utils'
import { DocusOptions } from 'types'

export const setupContentModule = (nuxt: Nuxt, options: DocusOptions) => {
  // Register API
  nuxt.hook('nitro:context', (ctx: NitroContext) => {
    if (ctx.preset === 'dev') {
      for (const dir of options.dirs) {
        const [path, key] = Array.isArray(dir) ? dir : [dir, dir.replace(/[/:]/g, '_')]
        ctx.storage.mounts[`docus:source:${key}`] = {
          driver: 'fs',
          driverOptions: {
            base: resolve(nuxt.options.rootDir, path)
          }
        }
      }

      // Prefix `docus:build` with assets to match production keys
      ctx.storage.mounts['assets:docus:build'] = {
        driver: 'fs',
        driverOptions: {
          base: resolve(nuxt.options.buildDir, 'docus/build')
        }
      }
    } else {
      ctx.assets.dirs['docus:build'] = {
        dir: resolve(nuxt.options.buildDir, 'docus/build'),
        meta: true
      }
    }
    // Set preview storage as memory if not set
    if (!ctx.storage.mounts['docus:preview']) {
      ctx.storage.mounts['docus:preview'] = {
        driver: 'memory'
      }
    }
  })

  // Add server routes for each content functions
  for (const api of ['get', 'list', 'search', 'navigation', 'preview']) {
    addServerMiddleware({
      route: resolveApiRoute(api),
      handle: resolveModule(`./server/api/${api}`, { paths: runtimeDir }).replace(/\.js$/, '.mjs')
    })
  }

  // Set publicRuntimeConfig $docus key
  ;(nuxt.options.publicRuntimeConfig as any).$docus = {
    apiBase: options.apiBase,
    // `tagMap` will use in `<Makdown>` to unwrap tags
    tagMap: options.transformers.markdown.tagMap
  }

  // Add content runtime plugin
  addPlugin(resolveModule('./content', { paths: templateDir }))
}
