import { resolve } from 'pathe'
import {
  defineNuxtModule,
  resolveModule,
  addServerMiddleware,
  addPlugin,
  useNuxt,
  addTemplate,
  extendWebpackConfig,
  installModule
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/kit'
import type { NitroContext } from '@nuxt/nitro'
import { joinURL } from 'ufo'
import type { DocusOptions } from 'types'
import { defaultContext } from './context'
import setupDevTarget from './module.dev'
import { useNuxtIgnoreList } from './utils'
import { resolveComponentsDir, resolveRuntimeDir, resolveTemplateDir, runtimeDir, templateDir } from './dirs'

export const resolveApiRoute = (route: string) => {
  const nuxt = useNuxt()
  const apiBase = nuxt.options.content?.apiBase || '_docus'
  return joinURL('/api', apiBase, route)
}

export default defineNuxtModule((nuxt: Nuxt) => ({
  configKey: 'content',
  defaults: {
    apiBase: '_docus',
    watch: nuxt.options.dev,
    database: {
      provider: 'lokijs'
    }
  },
  async setup(options: DocusOptions, nuxt: Nuxt) {
    // Extend context
    const docusContext = defaultContext

    useNuxtIgnoreList(nuxt).then(ignoreList => {
      // @ts-ignore
      docusContext.ignoreList = ignoreList
    })

    // Add root page into generate routes
    nuxt.options.generate.routes = nuxt.options.generate.routes || []
    nuxt.options.generate.routes.push('/')

    extendWebpackConfig(config => {
      config?.module?.rules.unshift({
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: [/node_modules/]
      })
    })

    // Transpile dependencies
    nuxt.options.build.transpile.push('property-information', 'nuxt-component-meta')

    // Setup runtime alias
    nuxt.options.alias['~docus/content'] = runtimeDir
    nuxt.options.alias['~docus/database'] = resolveRuntimeDir('database/providers', options.database.provider)

    // Register API
    nuxt.hook('nitro:context', (ctx: NitroContext) => {
      ctx.assets.dirs.content = {
        dir: resolve(nuxt.options.rootDir, 'content'),
        meta: true
      }

      ctx.storage.mounts.preview = {
        driver: 'memory'
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
      apiBase: options.apiBase
    }

    // Add Docus runtime plugin
    addPlugin(resolveTemplateDir('content'))

    // Add Docus context template
    for (const target of ['server', 'client']) {
      addTemplate({
        src: resolveModule('./context', { paths: templateDir }),
        filename: `docus/context.${target}.mjs`,
        options: {
          target,
          context: docusContext
        }
      })
    }

    // Setup dev target
    if (nuxt.options.dev) {
      setupDevTarget(options, nuxt)

      if (options.watch) {
        // Add reload API
        addServerMiddleware({
          route: `/api/${options.apiBase}/reload`,
          handle: resolveModule('./server/api/reload', { paths: runtimeDir })
        })

        // Add Hot plugin
        addPlugin(resolveModule('./hot', { paths: templateDir }))
      }
    }

    // Call docus:context hook
    nuxt.hook('modules:done', () => nuxt.callHook('docus:context', docusContext))

    /**
     * Register props component handler
     * Props component uses Nuxt Components dirs to find and process component
     **/
    nuxt.hook('components:dirs', dirs => {
      // Push local default Docus components
      dirs.push({
        path: resolveComponentsDir(),
        prefix: '',
        isAsync: false,
        level: 998
      })
    })

    await installModule(nuxt, {
      src: 'nuxt-component-meta/module'
    })
  }
}))
