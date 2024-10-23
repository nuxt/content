import type { ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import { defu } from 'defu'
import type { Nuxt } from '@nuxt/schema'
import { extendViteConfig, installModule } from '@nuxt/kit'
import type { ModuleOptions } from '../types'

export async function installMDCModule(contentOptions: ModuleOptions, nuxt: Nuxt) {
  // Install mdc module
  const highlight = nuxt.options.content?.build?.markdown?.highlight as unknown as MDCModuleOptions['highlight']
  nuxt.options.mdc = defu(nuxt.options.mdc, {
    highlight: highlight ? { ...highlight, noApiRoute: true } : highlight,
    components: {
      prose: true,
      map: contentOptions.renderer.alias,
    },
    headings: {
      anchorLinks: contentOptions.renderer.anchorLinks,
    },
  }) as MDCModuleOptions

  await installModule('@nuxtjs/mdc')

  // Update mdc optimizeDeps options
  extendViteConfig((config) => {
    config.optimizeDeps ||= {}
    config.optimizeDeps.include ||= []
    config.optimizeDeps.include.push('@nuxt/content > slugify')
    config.optimizeDeps.include = config.optimizeDeps.include
      .map(id => id.replace(/^@nuxtjs\/mdc > /, '@nuxt/content > @nuxtjs/mdc > '))
  })
}
