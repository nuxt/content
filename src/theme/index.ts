import chalk from 'chalk'
import defu from 'defu'
import { defineNuxtModule, Nuxt } from '@nuxt/kit'
import { loadConfig, writeConfig } from '../kit'
import { setThemeConfig } from './useThemeConfig'

export default defineNuxtModule({
  setup(_moduleOptions: any, nuxt: Nuxt) {
    // Get cacheDir
    const cacheDir = nuxt.options.alias['~docus/cache']

    const fileName = 'theme.config'

    let themeConfig = {}

    // Load Docus config
    const { configFile: _themeConfig, configPath } = loadConfig(fileName, nuxt.options.rootDir)

    if (_themeConfig) themeConfig = _themeConfig

    // Merge default settings and default theme settings
    const config = defu(themeConfig, {})

    // Init config in context
    setThemeConfig(config, true)

    // Write config json file
    nuxt.hook('modules:done', async () => await writeConfig(fileName, cacheDir, config))

    // Add badge
    nuxt.options.cli.badgeMessages.push('', chalk.bold('💄 Theme: ') + chalk.underline.yellow(nuxt.options.themeName))

    // Watch config
    nuxt.options.watch.push(configPath)
  }
})
