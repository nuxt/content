import { defineNuxtConfig } from '@nuxt/bridge'
import type { NuxtConfig } from '@nuxt/schema'
import jiti from 'jiti'
import docusModule from '../module'
import { distDir } from '../dirs'
import { NUXT_CONFIG_FILE } from './constants'
import { mergeConfig } from './extend'
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
    let themeNuxtConfigPath: string
    try {
      themeNuxtConfigPath = require.resolve(`${docusConfig.theme}/${NUXT_CONFIG_FILE}`)
    } catch (e) {
      themeNuxtConfigPath = `${docusConfig.theme}/${NUXT_CONFIG_FILE}`
    }

    // Get theme Nuxt config file
    const themeNuxtConfig = _require(themeNuxtConfigPath, userConfig.rootDir)

    // Merge theme Nuxt config with user project one
    userConfig = mergeConfig(themeNuxtConfig, userConfig)
  }

  // Add Docus modules
  if (!userConfig.modules) userConfig.modules = []
  userConfig.modules = [docusModule, ...userConfig.modules]

  return defineNuxtConfig(userConfig)
}
