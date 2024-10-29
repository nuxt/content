import type { ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import { defu } from 'defu'
import type { Nuxt } from '@nuxt/schema'
import { extendViteConfig, installModule } from '@nuxt/kit'
import type { ModuleOptions } from '../types'
import { setParserOptions } from './content'

export async function installMDCModule(contentOptions: ModuleOptions, nuxt: Nuxt) {
  const options = nuxt.options as unknown as { mdc: MDCModuleOptions, content: ModuleOptions }
  // Install mdc module
  const highlight = options.content?.build?.markdown?.highlight as unknown as MDCModuleOptions['highlight']
  options.mdc = defu(options.mdc, {
    highlight: highlight ? { ...highlight, noApiRoute: true } : highlight,
    components: {
      prose: true,
      map: contentOptions.renderer.alias,
    },
    headings: {
      anchorLinks: contentOptions.renderer.anchorLinks,
    },
  }) as MDCModuleOptions

  // Hook into mdc configs and store them for parser
  await nuxt.hook('mdc:configSources', async (mdcConfigs) => {
    const configs = await Promise.all(mdcConfigs.map(path => import(path).then(m => m.default)))

    setParserOptions({
      mdcConfigs: configs,
    })
  })

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
