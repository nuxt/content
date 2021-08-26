import fs from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve } from 'upath'
import clearModule from 'clear-module'
import chalk from 'chalk'
import defu from 'defu'
import jiti from 'jiti'
import { defineNuxtModule, Nuxt } from '@nuxt/kit'
import { docusDefaults } from './defaults'
import { setDocusSettings } from './useDocusSettings'

const _require = jiti(__filename)

export default defineNuxtModule({
  setup(_moduleOptions: any, nuxt: Nuxt) {
    // Get cache dir for Docus inside project rootDir
    const cacheDir = join(nuxt.options.rootDir, 'node_modules/.cache/docus')
    nuxt.options.alias['~docus/cache'] = cacheDir

    // Get Docus config path
    let settingsPath = resolve(nuxt.options.srcDir, 'docus.config')
    if (existsSync(settingsPath + '.js')) {
      settingsPath += '.js'
    } else if (existsSync(settingsPath + '.ts')) {
      settingsPath += '.ts'
    }

    // Get theme settings path
    if (!nuxt.options.themeDir) {
      // eslint-disable-next-line no-console
      console.warn('`themeDir` is not specified in current theme, fallback to default theme')
      nuxt.options.themeDir = resolve(__dirname, '..', 'defaultTheme')
    }

    let themeDefaultsPath = resolve(nuxt.options.themeDir, 'settings')
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
    const settings = defu(userSettings, {
      ...docusDefaults,
      theme: themeDefaults
    })
    setDocusSettings(settings)

    // Default title and description for pages
    nuxt.options.meta.name = settings.title
    nuxt.options.meta.description = settings.description

    nuxt.hook('modules:done', async () => {
      const jsonPath = join(cacheDir, 'docus-settings.json')

      // Replace the directory
      if (existsSync(cacheDir)) await fs.rm(cacheDir, { recursive: true })

      // Create cacheDir
      await fs.mkdir(cacheDir, { recursive: true })

      // Write settings
      await fs.writeFile(jsonPath, JSON.stringify(settings), { encoding: 'utf8' })
    })

    // Inject theme name into Nuxt build badge
    nuxt.hook('listen', () => {
      nuxt.options.cli.badgeMessages.push('', chalk.bold('💄 Theme: ') + chalk.underline.yellow(nuxt.options.themeName))
    })

    // Watch settings
    nuxt.options.watch.push(settingsPath)
  }
})
