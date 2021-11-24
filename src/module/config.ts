import defu from 'defu'
import type { Nuxt } from '@nuxt/schema'
import chalk from 'chalk'
import { version } from '../../package.json'
import { setDocusConfig } from '../context'
import { setupThemeModule } from './theme'
import { loadConfig, writeConfig, defineDocusConfig } from './utils'
import { DOCUS_CONFIG_FILE } from './constants'
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
  const cacheDir = nuxt.options.alias['#docus/cache']

  // Load Docus config
  const { configFile: docusConfig, configPath } = loadConfig<DocusConfig>(DOCUS_CONFIG_FILE, nuxt.options.rootDir)

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
  nuxt.hook('modules:done', async () => await writeConfig(DOCUS_CONFIG_FILE, cacheDir, config))

  // Watch config
  nuxt.options.watch.push(configPath)
}
