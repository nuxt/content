import fs from 'fs/promises'
import { existsSync } from 'fs'
import jiti from 'jiti'
import { resolve, join, dirname } from 'pathe'
import clearModule from 'clear-module'
import { useNuxt } from '@nuxt/kit'
import { joinURL } from 'ufo'
import type { Nuxt } from '@nuxt/schema'
import { distDir } from '../dirs'
import { NUXT_CONFIG_FILE, THEME_CONFIG_FILE } from './constants'
import { useDefaultOptions } from './options'
import type { DocusConfig, ThemeConfig } from 'types'

/**
 * Define the the theme configuration object.
 */
export const defineThemeConfig = <T = ThemeConfig>(config: T) => config

/**
 * Define the Docus configuration object.
 */
export const defineDocusConfig = (config: DocusConfig) => config

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
    data.configFile = jiti(distDir)(data.configPath)

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
    // Use `require.resolve` as most of themes will be modules
    themePath = require.resolve(path, {
      paths: [rootDir]
    })

    // We use the module as a classic directory to import {nuxt|theme}.config
    // Resolve the dirname as `require.resolve` gives the `main` file and not the parent directory
    themePath = dirname(themePath)
  } catch (e) {
    // Use raw path in case the theme is local
    themePath = path
  }

  // Resolve theme theme.config file
  const { configFile: themeConfig, configPath: themeConfigPath } = loadConfig(THEME_CONFIG_FILE, themePath)

  // Resolve theme nuxt.config file
  const { configFile: nuxtConfig, configPath: nuxtConfigPath } = loadConfig(NUXT_CONFIG_FILE, themePath)

  return {
    themePath,
    themeConfig,
    themeConfigPath,
    nuxtConfig,
    nuxtConfigPath
  }
}

export const buildExternals = ['@nuxt/bridge', '@nuxt/kit', '#app', '@vue/composition-api']

export const resolveApiRoute = (route: string) => {
  const nuxt = useNuxt()
  const apiBase = nuxt.options.content?.apiBase || useDefaultOptions(nuxt).apiBase
  return joinURL('/api', apiBase, route)
}

export async function loadNuxtIgnoreList(nuxt: Nuxt): Promise<string[]> {
  const ignore = ['**/-*.*', '**/node_modules/**', '**/.git/**', '**/.**']
  const ignoreFile = resolve(nuxt.options.rootDir, '.nuxtignore')
  const ignoreContent = await fs.readFile(ignoreFile, { encoding: 'utf-8' }).catch(() => '')

  if (ignoreContent) {
    ignore.push(...ignoreContent.split('\n').filter(Boolean))
  }

  const refinedList = ignore.map((pattern: any) => {
    if (typeof pattern === 'string') {
      return pattern.replace(/\//g, ':')
    }
    return pattern
  })

  return refinedList
}

export { withDocus } from './withDocus'
