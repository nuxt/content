import fs from 'fs/promises'
import { existsSync } from 'fs'
import jiti from 'jiti'
import { resolve, join } from 'pathe'
import clearModule from 'clear-module'
import { resolveModule, useNuxt } from '@nuxt/kit'
import { joinURL } from 'ufo'
import type { Nuxt } from '@nuxt/kit'
import { distDir } from '../dirs'
import { logger } from '../runtime/utils/log'
import { THEME_CONFIG_FILE } from './constants'
import { useDefaultOptions } from './options'
import type { DocusConfig, DefaultThemeConfig, ThemeNuxtConfig } from 'types'

export const defineThemeNuxtConfig = (config: ThemeNuxtConfig) => config

export const defineThemeConfig = <T = DefaultThemeConfig>(config: T) => config

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
  let themeConfig: DefaultThemeConfig = {}

  // resolve theme config path
  let themeConfigPath: string = resolveModule(join(path, THEME_CONFIG_FILE), { paths: rootDir })
  try {
    themeConfigPath = jiti(rootDir).resolve(themeConfigPath)
  } catch (err) {
    return themeConfig
  }

  // load theme config
  try {
    themeConfig = jiti(rootDir)(themeConfigPath)
  } catch (err) {
    logger.warn(`Could not load theme config: ${themeConfigPath}`, err)
  }
  themeConfig = themeConfig.default || themeConfig

  return themeConfig
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
