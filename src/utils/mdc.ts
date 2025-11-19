import type { MdcConfig } from '@nuxtjs/mdc'
import type { Nuxt } from '@nuxt/schema'
import { extendViteConfig } from '@nuxt/kit'
import { createJiti } from 'jiti'
import type { ModuleOptions } from '../types'
import { setParserOptions } from './content'

export async function configureMDCModule(contentOptions: ModuleOptions, nuxt: Nuxt) {
  // Hook into mdc configs and store them for parser
  nuxt.hook('mdc:configSources', async (mdcConfigs) => {
    if (mdcConfigs.length) {
      const jiti = createJiti(nuxt.options.rootDir)
      const configs = await Promise.all(mdcConfigs.map(path => jiti.import(path).then(m => (m as { default: MdcConfig }).default || m)))

      setParserOptions({
        mdcConfigs: configs,
      })
    }
  })

  // Update mdc optimizeDeps options
  extendViteConfig((config) => {
    config.optimizeDeps ||= {}
    config.optimizeDeps.include ||= []
    config.optimizeDeps.include.push('@nuxt/content > slugify')
    config.optimizeDeps.include = config.optimizeDeps.include
      .map(id => id.replace(/^@nuxtjs\/mdc > /, '@nuxt/content > @nuxtjs/mdc > '))
  })
}
