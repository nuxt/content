import type { ModuleOptions as MDCModuleOptions, MdcConfig } from '@nuxtjs/mdc'
import { defu } from 'defu'
import type { Nuxt } from '@nuxt/schema'
import { extendViteConfig, installModule } from '@nuxt/kit'
import { createJiti } from 'jiti'
import type { ModuleOptions } from '../types'
import { setParserOptions } from './content'

export async function installMDCModule(contentOptions: ModuleOptions, nuxt: Nuxt) {
  const options = nuxt.options as unknown as { mdc: MDCModuleOptions }
  // Install mdc module
  const highlight = contentOptions.build?.markdown?.highlight as unknown as MDCModuleOptions['highlight']

  options.mdc = defu({
    highlight: highlight !== false
      ? { ...highlight, noApiRoute: (options.mdc?.highlight as { noApiRoute: boolean })?.noApiRoute ?? true }
      : highlight,
    components: {
      prose: true,
      map: contentOptions.renderer.alias,
    },
    headings: {
      anchorLinks: contentOptions.renderer.anchorLinks,
    },
    remarkPlugins: contentOptions.build?.markdown?.remarkPlugins,
    rehypePlugins: contentOptions.build?.markdown?.rehypePlugins,
  }, options.mdc) as MDCModuleOptions

  // Hook into mdc configs and store them for parser
  await nuxt.hook('mdc:configSources', async (mdcConfigs) => {
    if (mdcConfigs.length) {
      const jiti = createJiti(nuxt.options.rootDir)
      const configs = await Promise.all(mdcConfigs.map(path => jiti.import(path).then(m => (m as { default: MdcConfig }).default || m)))

      setParserOptions({
        mdcConfigs: configs,
      })
    }
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
