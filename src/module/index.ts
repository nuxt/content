import { join, resolve } from 'pathe'
import { defineNuxtModule, resolveModule, addServerMiddleware, addPlugin, addTemplate, installModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/kit'
import type { NitroContext } from '@nuxt/nitro'
import { resolveAppDir, resolveRuntimeDir, runtimeDir, templateDir } from '../dirs'
import { useDefaultOptions } from './options'
import { setupDevTarget } from './dev'
import { loadNuxtIgnoreList, resolveApiRoute } from './utils'
import { setupAppModule } from './app'
import { setupConfigModule } from './config'
import { setupI18nModule } from './i18n'
import { setupComponentMetaModule } from './meta'
import type { DocusOptions } from 'types'

export default defineNuxtModule((nuxt: Nuxt) => ({
  configKey: 'content',
  defaults: useDefaultOptions(nuxt),
  async setup(options: DocusOptions, nuxt: Nuxt) {
    loadNuxtIgnoreList(nuxt).then(ignoreList => {
      // @ts-ignore
      options.ignoreList = ignoreList
    })

    // Add root page into generate routes
    nuxt.options.generate.routes = nuxt.options.generate.routes || []
    nuxt.options.generate.routes.push('/')

    // Transpile dependencies
    nuxt.options.build.transpile.push('property-information', 'nuxt-component-meta')

    // Setup runtime alias
    nuxt.options.alias['#docus$'] = runtimeDir
    nuxt.options.alias['#docus/composables'] = resolveAppDir('composables')
    nuxt.options.alias['#docus/database'] = resolveRuntimeDir('database/providers', options.database.provider)
    // Get cache dir for Docus inside project rootDir
    nuxt.options.alias['#docus/cache'] = join(nuxt.options.rootDir, 'node_modules/.cache/docus')

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
        // prefix `docus:build` with assets to match production keys
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

    // Add Docus runtime plugin
    addPlugin(resolveModule('./content', { paths: templateDir }))

    // Add Docus context template
    addTemplate({
      src: resolveModule('./options', { paths: templateDir }),
      filename: 'docus/options.mjs',
      options
    })

    // Call docus:context hook
    // @ts-ignore
    nuxt.hook('modules:done', () => nuxt.callHook('docus:options', options))

    // Setup dev target
    if (nuxt.options.dev) {
      setupDevTarget(options, nuxt)
    }

    setupAppModule(nuxt)

    setupConfigModule(nuxt)

    await setupI18nModule(nuxt)

    await setupComponentMetaModule(nuxt)

    await installModule(nuxt, '@nuxt/image')
  }
}))
