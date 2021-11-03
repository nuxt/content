import defu from 'defu'
import type { Nuxt } from '@nuxt/kit'
import chalk from 'chalk'
import { version } from '../package.json'
import { setupThemeModule } from './theme'
import { loadConfig, writeConfig, defineDocusConfig } from './kit'
import { setDocusConfig } from './context'
import { resolveRuntimeDir } from './dirs'
import type { DocusConfig } from 'types'

const defaultConfig = defineDocusConfig({
  title: 'Docus',
  contentDir: 'content',
  url: 'http://localhost:3000',
  description: 'A website built with Docus.',
  template: 'page'
})

export const setupConfigModule = (nuxt: Nuxt) => {
  // Get cacheDir
  const cacheDir = nuxt.options.alias['#docus-cache']

  const fileName = 'docus.config'

  // Load Docus config
  const { configFile: docusConfig, configPath } = loadConfig<DocusConfig>(fileName, nuxt.options.rootDir)

  // Merge user config and default Docus config
  const config = defu(docusConfig || {}, defaultConfig)

  // Add badge
  nuxt.options.cli.badgeMessages.push(chalk.bold('📝 Docus: ') + chalk.underline.yellow(`v${version}`))

  // Init config in context
  setDocusConfig(config, true)

  // Setup theme module
  setupThemeModule(nuxt)

  // @ts-ignore - Default title and description for pages
  nuxt.options.meta.name = config.title

  // @ts-ignore
  nuxt.options.meta.description = config.description

  // Write config json file
  nuxt.hook('modules:done', async () => await writeConfig(fileName, cacheDir, config))

  // Watch config
  nuxt.options.watch.push(configPath)

  // Context
  nuxt.options.alias['#docus'] = resolveRuntimeDir('.')
}
