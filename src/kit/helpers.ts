import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import jiti from 'jiti'
import { resolve, join } from 'upath'
import clearModule from 'clear-module'
import type { DocusTheme, DocusConfig, DefaultThemeConfig, ThemeNuxtConfig } from 'types'

export const defineThemeNuxtConfig = (config: ThemeNuxtConfig) => config

export const defineThemeConfig = <T = DefaultThemeConfig>(config: T) => config

export const defineDocusConfig = (config: DocusConfig) => config

const _require = jiti(__filename)

export const isDocusTheme = (theme: any): theme is DocusTheme => {
  return !!(theme.defineThemeConfig && theme.nuxtConfig && theme.themeConfig)
}

export const checkDocusTheme = (theme: any) => {
  if (!isDocusTheme(theme)) {
    /* eslint-disable no-console */
    console.warn('A Docus theme must export at least 3 things:')
    console.warn('- `nuxtConfig`: A valid Nuxt config defined with defineThemeNuxtConfig.')
    console.warn('- `themeConfig`: A default theme config.')
    console.warn('- `defineThemeConfig`: A helper function to define the theme config with type safety.')
    console.warn('- `ThemeConfigInterface` (optional): You should also export the theme config interface.')
    /* eslint-enable no-console */

    const missingKeys = ['nuxtConfig', 'themeConfig', 'defineThemeConfig']
      .filter(key => !Object.keys(theme).includes(key))
      .join(', ')

    throw new Error('Your theme is missing: ' + missingKeys)
  }
}

export const loadConfig = <T = any>(file: string, rootDir: string): { configFile: false | T; configPath: string } => {
  const data = {
    configFile: false as const,
    configPath: resolve(rootDir, file)
  }

  // Get Docus config path
  if (existsSync(data.configPath + '.js')) data.configPath += '.js'
  else if (existsSync(data.configPath + '.ts')) data.configPath += '.ts'
  else return data

  // Delete Node cache for config files
  clearModule(data.configPath)

  // Get user settings
  try {
    data.configFile = _require(data.configPath)

    // @ts-ignore
    data.configFile = data.configFile?.default || data.configFile
  } catch (err) {
    throw new Error(`Could not find ${file}, this file is needed for Docus.`)
  }

  return data
}

export const writeConfig = async (file: string, cacheDir: string, content: any) => {
  const jsonPath = join(cacheDir, `${file}.json`)

  // Create cacheDir if it does not exists
  if (!existsSync(cacheDir)) await fs.mkdir(cacheDir, { recursive: true })

  // Remove existing file
  if (existsSync(jsonPath)) await fs.rm(jsonPath)

  // Write config
  await fs.writeFile(jsonPath, JSON.stringify(content.default || content), { encoding: 'utf8' })
}

export const loadTheme = (path: string, rootDir: string) => {
  // Resolve theme path
  let themePath: string
  try {
    themePath = require.resolve(path)
  } catch (e) {
    themePath = path
  }

  // Require the theme
  let theme: DocusTheme = jiti(rootDir)(themePath)

  // @ts-ignore - If import has default key return it
  theme = theme?.default || theme

  return theme
}
