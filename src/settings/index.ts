import fs from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve } from 'upath'
import clearModule from 'clear-module'
import chalk from 'chalk'
import { Module } from '@nuxt/types'
import defu from 'defu'
import jiti from 'jiti'
import { docusDefaults } from './defaults'

const _require = jiti(__filename)

export default <Module>function settingsModule() {
  const { options, hook } = this.nuxt

  // Initialize server-side $docus
  if (!this.$docus) {
    this.$docus = {}
  }

  // Get cache dir for Docus inside project rootDir
  const cacheDir = join(options.rootDir, 'node_modules/.cache/docus')
  options.alias['~docus-cache'] = cacheDir

  // Get Docus config path
  let settingsPath = resolve(options.srcDir, 'docus.config')
  if (existsSync(settingsPath + '.js')) {
    settingsPath += '.js'
  } else if (existsSync(settingsPath + '.ts')) {
    settingsPath += '.ts'
  }

  // Get theme settings path
  if (!options.themeDir) {
    // eslint-disable-next-line no-console
    console.warn('`themeDir` is not specified in current theme, fallback to default theme')
    options.themeDir = resolve(__dirname, '..', 'defaultTheme')
  }

  let themeDefaultsPath = resolve(options.themeDir, 'settings')
  if (existsSync(themeDefaultsPath + '.js')) {
    themeDefaultsPath += '.js'
  } else if (existsSync(themeDefaultsPath + '.ts')) {
    themeDefaultsPath += '.ts'
  }

  // Delete Node cache for settings files
  clearModule(themeDefaultsPath)
  clearModule(settingsPath)
  // Get user settings
  let userSettings
  try {
    userSettings = _require(settingsPath)
    userSettings = userSettings?.default || userSettings
  } catch (err) {
    // eslint-disable-next-line no-console
    console.info('Using default Docus config, please create a `docus.config.js` to overwrite it.')
  }
  // Get theme defaults
  let themeDefaults
  try {
    themeDefaults = _require(themeDefaultsPath)
    themeDefaults = themeDefaults?.default || themeDefaults
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Could not fetch theme settings in ${themeDefaultsPath}`)
  }
  // Merge default settings and default theme settings
  const settings = defu(userSettings, docusDefaults)
  settings.theme = defu(userSettings?.theme, themeDefaults)

  // Inject settings into $docus for other modules
  this.$docus.settings = settings

  // Default title and description for pages
  options.meta.name = settings.title
  options.meta.description = settings.description

  hook('modules:done', async () => {
    const jsonPath = join(cacheDir, 'docus-settings.json')

    // Replace the directory
    if (existsSync(cacheDir)) {
      await fs.rmdir(cacheDir, { recursive: true })
    }
    await fs.mkdir(cacheDir, { recursive: true })

    // Write settings
    await fs.writeFile(jsonPath, JSON.stringify(this.$docus.settings), { encoding: 'utf8' })
  })

  // Inject theme name into Nuxt build badge
  hook('listen', () => {
    options.cli.badgeMessages.push('', chalk.bold('💄 Theme: ') + chalk.underline.yellow(options.themeName))
  })

  // Watch settings
  options.watch.push(settingsPath)
}
