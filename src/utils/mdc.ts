import type { MdcConfig, ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import type { Nuxt } from '@nuxt/schema'
import { extendViteConfig } from '@nuxt/kit'
import { createJiti } from 'jiti'
import type { ModuleOptions } from '../types'
import { setMdcConfigResolver } from './content'

export async function configureMDCModule(contentOptions: ModuleOptions, nuxt: Nuxt) {
  const mdcOptions = (nuxt.options as unknown as { mdc: MDCModuleOptions }).mdc
  contentOptions.renderer.alias = {
    ...(mdcOptions?.components?.map || {}),
    ...(contentOptions.renderer.alias || {}),
  }

  // Provide a lazy resolver for mdc configs. When the highlighter needs
  // configs it fires mdc:configSources to collect paths from all modules
  // (including file-based configs registered by @nuxtjs/mdc), then imports
  // them. This avoids any dependency on modules:done hook ordering.
  let _configs: MdcConfig[] | undefined
  setMdcConfigResolver(async () => {
    if (!_configs) {
      const paths: string[] = []
      await nuxt.callHook('mdc:configSources', paths)
      const jiti = createJiti(nuxt.options.rootDir)
      _configs = paths.length
        ? await Promise.all(paths.map(path => jiti.import(path).then(m => (m as { default: MdcConfig }).default || m)))
        : []
    }
    return _configs
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
