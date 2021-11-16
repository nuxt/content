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
import type { Options as ComponentMetaModuleOptions } from 'nuxt-component-meta/dist/module'
import type { Documentation } from 'vue-docgen-api'
import type { ASTElement } from 'vue-template-compiler'
import { joinURL } from 'ufo'
import { useDefaultContext } from './context'
import setupDevTarget from './module.dev'
import { useNuxtIgnoreList } from './utils'
import { resolveComponentsDir, resolveRuntimeDir, resolveTemplateDir, runtimeDir, templateDir } from './dirs'
import type { DocusContext } from 'types'

export const resolveApiRoute = (route: string) => {
  const nuxt = useNuxt()
  const apiBase = nuxt.options.content?.apiBase || '_docus'
  return joinURL('/api', apiBase, route)
}

export default defineNuxtModule((nuxt: Nuxt) => ({
  configKey: 'content',
  defaults: useDefaultContext(nuxt),
  async setup(docusContext: DocusContext, nuxt: Nuxt) {
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
    nuxt.options.alias['~docus/database'] = resolveRuntimeDir('database/providers', docusContext.database.provider)

    // Register API
    nuxt.hook('nitro:context', (ctx: NitroContext) => {
      if (ctx.preset === 'dev') {
        for (const dir of docusContext.dirs) {
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
      apiBase: docusContext.apiBase,
      // `tagMap` will use in `<Makdown>` to unwrap tags
      tagMap: docusContext.transformers.markdown.tagMap
    }

    // Add Docus runtime plugin
    addPlugin(resolveTemplateDir('content'))

    // Add Docus context template
    addTemplate({
      src: resolveModule('./context', { paths: templateDir }),
      filename: 'docus/context.mjs',
      options: docusContext
    })

    // Setup dev target
    if (nuxt.options.dev) {
      setupDevTarget(docusContext, nuxt)

      if (docusContext.watch) {
        // Add reload API
        addServerMiddleware({
          route: `/api/${docusContext.apiBase}/reload`,
          handle: resolveModule('./server/api/reload', { paths: runtimeDir })
        })

        // Add Hot plugin
        addPlugin(resolveModule('./hot', { paths: templateDir }))
      }
    }

    // Call docus:context hook
    // @ts-ignore
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
      src: 'nuxt-component-meta/module',
      options: {
        parserOptions: {
          addTemplateHandlers: [
            (documentation: Documentation, ast: ASTElement) => {
              if (ast.tag === 'Markdown') {
                const useValue = ast.props?.find(prop => prop.name === 'use')?.value as
                  | { content: string }
                  | string
                  | undefined
                const slotName = (typeof useValue === 'object' ? useValue.content : useValue) ?? 'default'
                documentation.getSlotDescriptor(slotName)
              }
            }
          ] as unknown[]
        }
      } as ComponentMetaModuleOptions
    })
  }
}))
