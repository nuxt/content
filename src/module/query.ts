import { addTemplate, templateUtils } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { resolve } from 'pathe'
import defu from 'defu'

import type { ModuleOptions } from '../module'

export function setupQueryModule(options: ModuleOptions, nuxt: Nuxt) {
  addTemplate({
    filename: 'docus-query-plugins.mjs',
    write: true,
    getContents: () => `${templateUtils.importSources(options.query?.plugins || [])}

    export const plugins = [${(options.query?.plugins || []).map(src => templateUtils.importName(src)).join(',\n')}]
    `
  })

  nuxt.options.alias['#docus-query-plugins'] = resolve(nuxt.options.buildDir, 'docus-query-plugins')
  nuxt.hook('nitro:context', ctx => {
    ctx.alias['#docus-query-plugins'] = resolve(nuxt.options.buildDir, 'docus-query-plugins.mjs')

    // Inline query template in Nitro bundle
    ctx.externals = defu(ctx.externals, {
      inline: [ctx.alias['#docus-query-plugins']]
    })
  })
}
