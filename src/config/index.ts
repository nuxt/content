import defu from 'defu'
import { defineNuxtModule, Nuxt, requireModule } from '@nuxt/kit'
import chalk from 'chalk'
import { resolve } from 'upath'
import { loadConfig, writeConfig } from '../kit'
import { DocusConfig } from '../'
import { version } from '../../package.json'
import defaultConfig from './defaults'
import { setDocusConfig } from './useDocusConfig'

export default defineNuxtModule({
  setup(_moduleOptions: any, nuxt: Nuxt) {
    // Get cacheDir
    const cacheDir = nuxt.options.alias['~docus/cache']

    const fileName = 'docus.config'

    // Load Docus config
    const { configFile: docusConfig, configPath } = loadConfig<DocusConfig>(fileName, nuxt.options.rootDir)

    // Only loads the theme module if `theme` key exists on Docus
    if (docusConfig && docusConfig.theme) requireModule(resolve(__dirname, '../theme'))

    // Merge user config and default Docus config
    const config = defu(docusConfig || {}, defaultConfig)

    // Init config in context
    setDocusConfig(config, true)

    // Default title and description for pages
    nuxt.options.meta.name = config.title
    nuxt.options.meta.description = config.description

    // Write config json file
    nuxt.hook('modules:done', async () => await writeConfig(fileName, cacheDir, config))

    // Add badge
    nuxt.options.cli.badgeMessages.push(chalk.bold('📝 Docus: ') + chalk.underline.yellow(`v${version}`))

    // Watch config
    nuxt.options.watch.push(configPath)
  }
})
