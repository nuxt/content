import chalk from 'chalk'
import defu from 'defu'
import { Nuxt } from '@nuxt/schema'
import { setThemeConfig, useDocusConfig } from '../context'
import { loadConfig, loadTheme, writeConfig } from './utils'
import { THEME_CONFIG_FILE } from './constants'
import { ThemeConfig } from 'types'

export const setupThemeModule = (nuxt: Nuxt) => {
  // Get cacheDir
  const cacheDir = nuxt.options.alias['#docus/cache']

  const docusConfig = useDocusConfig()

  let themeConfig: ThemeConfig = {}

  // Load theme
  if (docusConfig?.theme) themeConfig = loadTheme(docusConfig.theme, nuxt.options.rootDir).themeConfig

  // Load user project theme config file
  const { configFile: userThemeConfig, configPath } = loadConfig(THEME_CONFIG_FILE, nuxt.options.rootDir)

  // Merge default theme config and user theme config
  themeConfig = defu(userThemeConfig || {}, themeConfig)

  // Init config in context
  setThemeConfig(themeConfig, true)

  // Write config json file
  nuxt.hook('modules:done', async () => await writeConfig(THEME_CONFIG_FILE, cacheDir, themeConfig))

  // Add badge
  nuxt.options.cli.badgeMessages.push(
    '',
    chalk.bold('💄 Theme: ') + chalk.underline.yellow(themeConfig?.name || 'Blank')
  )

  // Watch config
  nuxt.options.watch.push(configPath)
}
