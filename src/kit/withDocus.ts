import { NuxtConfig } from '@nuxt/kit'
import jiti from 'jiti'
import type { DocusConfig } from '../../types'
import _nuxtConfig from '../nuxt.config'
import { mergeConfig } from './extend'
import { loadTheme, checkDocusTheme } from './helpers'

const _require = (path: string, root: string = __filename, exportName: string = 'default') => {
  const file = jiti(root)(path)

  return file[exportName] || file
}

const ERRORS = {
  rootDir: 'You must specify `rootDir` key inside your nuxt.config.',
  theme: 'You must specify `theme` key inside your docus.config.',
  themeDir: 'You must specify `themeDir` inside your theme nuxtConfig.',
  themeName: 'You must specify `themeName` inside your theme nuxtConfig.'
}

export function withDocus(userConfig: NuxtConfig & { rootDir: string }): NuxtConfig {
  // Check rootDir key existence in userConfig (only required key)
  if (!userConfig.rootDir) throw new Error(ERRORS.rootDir)

  // Resolve project Docus config
  let _docusConfig: DocusConfig = {}
  try {
    _docusConfig = _require('./docus.config', userConfig.rootDir)
    _nuxtConfig.hasDocusConfig = true
  } catch (e) {
    _nuxtConfig.hasDocusConfig = false
  }

  // Set second level extend for theme config
  let appConfig: NuxtConfig = _nuxtConfig as NuxtConfig

  // Set hasThemeConfig default
  appConfig.hasThemeConfig = false

  // Check theme key existence in docusConfig
  if (_docusConfig && _docusConfig.theme) {
    // Resolve theme Nuxt config
    const _theme = loadTheme(_docusConfig.theme, userConfig.rootDir)

    // Check Docus theme
    checkDocusTheme(_theme)

    // Extract themeNuxtConfig from theme module
    const _themeNuxtConfig = _theme.nuxtConfig

    // Check themeDir key existence in themeConfig
    if (!_themeNuxtConfig.themeDir) throw new Error(ERRORS.themeDir)

    // Check themeName key existence in themeConfig
    if (!_themeNuxtConfig.themeName) throw new Error(ERRORS.themeName)

    // Merge Docus and theme Nuxt configs
    appConfig = mergeConfig(_themeNuxtConfig as NuxtConfig, appConfig)

    // Quick check, verifying if theme.config is present
    try {
      _require('./theme.config', userConfig.rootDir)
      appConfig.hasThemeConfig = true
    } catch (e) {}

    appConfig.hasTheme = true
  } else {
    appConfig.hasTheme = false
  }

  // Merge previous config with user Nuxt config
  appConfig = mergeConfig(userConfig, appConfig)

  return appConfig
}
