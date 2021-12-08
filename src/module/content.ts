import { resolveModule, addServerMiddleware, addPlugin, resolveAlias, addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { NitroContext } from '@nuxt/nitro'
import { resolve } from 'pathe'
import { runtimeDir, templateDir } from '../dirs'
import { loadNuxtIgnoreList, resolveApiRoute } from './utils'
import { DocusOptions } from 'types'

export const setupContentModule = async (nuxt: Nuxt, options: DocusOptions) => {
  // Register API
  nuxt.hook('nitro:context', (ctx: NitroContext) => {
    ctx.env.alias = ctx.env.alias || {}
    ctx.env.alias['#docus/markdown'] = resolveAlias('#build/docus/markdown.mjs', nuxt.options.alias)

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

  // Set publicRuntimeConfig docus key
  nuxt.options.publicRuntimeConfig.docus = {
    apiBase: options.apiBase,
    // `tagMap` will use in `<Makdown>` to unwrap tags
    tagMap: options.transformers.markdown.tagMap
  }
  // Server side runtime configs
  nuxt.options.privateRuntimeConfig.docus = {
    search: options.search,
    locales: options.locales,
    database: options.database
  }

  // load ignore list
  const ignoreList = await loadNuxtIgnoreList(nuxt)
  nuxt.options.privateRuntimeConfig.docus.ignoreList = ignoreList

  // Add content runtime plugin
  addPlugin(resolveModule('./content', { paths: templateDir }))

  // Add Docus markdown transformer template
  addTemplate({
    filename: 'docus/markdown.mjs',
    getContents: () => {
      const serializeImportName = (id: string) => '_' + id.replace(/[^a-zA-Z0-9_$]/g, '_')
      const refineImports = (imports: any[] = []) => {
        return imports.map(item => ({
          path: item.path,
          name: item[0] || item.name || item,
          instance: serializeImportName(item[0] || item.name || item),
          options: item[0] || item.options || {}
        }))
      }

      const config = {
        ...options.transformers.markdown,
        remarkPlugins: refineImports(options.transformers.markdown.remarkPlugins),
        rehypePlugins: refineImports(options.transformers.markdown.rehypePlugins),
        components: refineImports(options.transformers.markdown.components)
      }

      return `import { parse } from '@docus/mdc'
      ${config.components
        .concat(config.remarkPlugins, config.rehypePlugins)
        .map(item => `import ${item.instance} from '${item.path || item.name}';`)
        .join('\n')}
      const config = ${JSON.stringify(config)};
      ${config.remarkPlugins.map((item, i) => `config.remarkPlugins[${i}].instance = ${item.instance}`).join('\n')}
      ${config.rehypePlugins.map((item, i) => `config.rehypePlugins[${i}].instance = ${item.instance}`).join('\n')}
      ${config.components.map((item, i) => `config.components[${i}].instance = ${item.instance}`).join('\n')}
      export default (_id, input) => parse(input, config)`
    },
    options
  })
}
