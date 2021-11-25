import { defineNuxtConfig } from '@nuxt/bridge'
import type { NuxtConfig } from '@nuxt/schema'
import jiti from 'jiti'
import docusModule from '../module'
import { distDir } from '../dirs'
import { mergeConfig } from './extend'
import { loadTheme } from './utils'
import type { DocusConfig } from 'types'

const ERRORS = {
  rootDir: 'You must specify `rootDir` key inside your nuxt.config.'
}

const _require = (path: string, root: string = distDir, exportName: string = 'default') => {
  const file = jiti(root)(path)

  return file[exportName] || file
}

/**
 * Configuration helper adding everything related to Docus to your own Nuxt configuration.
 */
export function withDocus(userConfig: NuxtConfig): NuxtConfig {
  // Check rootDir key existence in userConfig (only required key)
  if (!userConfig.rootDir) throw new Error(ERRORS.rootDir)

  // Resolve project Docus config
  let docusConfig: DocusConfig = {}
  try {
    docusConfig = _require('./docus.config', userConfig.rootDir)
  } catch (e) {}

  if (docusConfig.theme) {
    // Resolve theme path
    const { nuxtConfig: themeNuxtConfig } = loadTheme(docusConfig.theme, userConfig.rootDir)

    // Merge theme Nuxt config with user project one
    userConfig = mergeConfig(themeNuxtConfig, userConfig)
  }

  // Add Docus modules
  if (!userConfig.buildModules) userConfig.buildModules = []
  userConfig.buildModules = [docusModule, ...userConfig.buildModules]

  return defineNuxtConfig(userConfig)
}
