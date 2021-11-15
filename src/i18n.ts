import fs from 'fs'
import { resolve } from 'pathe'
import defu from 'defu'
import { addPlugin, installModule, Nuxt } from '@nuxt/kit'
import chalk from 'chalk'
import type { Options as NuxtI18nOptions } from '@nuxtjs/i18n'
import iso639 from 'iso-639-1'
import { useDocusConfig } from './context'
import { resolveTemplateDir } from './dirs'

// Default i18n config
const defaultI18nConfig: NuxtI18nOptions = {
  baseUrl: (nuxt: any) => nuxt.app?.$docus?.config?.value?.url || '',
  locales: [],
  defaultLocale: 'en',
  parsePages: false,
  vuex: false,
  vueI18n: {
    fallbackLocale: 'en',
    dateTimeFormats: {
      en: {
        long: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        }
      },
      fr: {
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        }
      }
    }
  }
}

export const setupI18nModule = async (nuxt: Nuxt) => {
  const config = useDocusConfig()

  // Merge default options w/ user-project
  nuxt.options.i18n = defu(nuxt.options.i18n, defaultI18nConfig)

  const i18nConfig = nuxt.options.i18n

  // Detect available locales from the content directory
  try {
    // Check if `locales` key is already set by user / theme.
    if (!nuxt.options.i18n?.locales?.length) {
      const contentDir = resolve(nuxt.options.srcDir, config?.contentDir || 'content')

      const contentDirectories = fs.readdirSync(contentDir)

      // Assign locales from contentDir root directories
      i18nConfig.locales = contentDirectories
        // Filter iso639 valid codes
        .filter((lang: string) => !!iso639.getName(lang))
        // Map iso639 code to valid `LocaleObject`
        .map(code => ({ code, iso: code, name: iso639.getName(code) }))

      // No locales detected from contentDir; get to fallback.
      if (!i18nConfig.locales.length) throw new Error('No locales detected from `contentDir`! Using fallback.')
    }
  } catch (e) {
    // Fallback to `en`
    const defaultLocale = i18nConfig.defaultLocale || 'en'
    i18nConfig.locales = [
      {
        code: defaultLocale,
        iso: defaultLocale,
        name: iso639.getName(defaultLocale) || defaultLocale
      }
    ]
  }

  // Add i18n plugin
  addPlugin(resolveTemplateDir('i18n.js'))

  // Add languages badge
  const localesList = i18nConfig.locales?.map(({ code }: any) => code).join(', ') || 'en'
  nuxt.options.cli.badgeMessages.push('', chalk.bold('📙 Languages: ') + chalk.underline.yellow(localesList))

  // Setup i18n module
  await installModule(nuxt, '@nuxtjs/i18n')

  // @ts-ignore - Get available locales and set default locale
  nuxt.hook('docus:context', docusContext => {
    const codes = nuxt.options.i18n?.locales.map((locale: any) => locale.code || locale)
    docusContext.locales.codes = codes || docusContext.locales.codes
    docusContext.locales.defaultLocale = nuxt.options.i18n?.defaultLocale || docusContext.locales.defaultLocale
  })

  /**
   * Temporary fix
   * This should be done by nuxt-i18n
   */
  nuxt.hook('build:extendRoutes', routes => {
    const index = routes.findIndex(route => route.path === '/*')
    const [all] = routes.splice(index, 1)
    routes.push(all)
  })
}
