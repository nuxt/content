import fs from 'fs'
import { resolve, join, relative } from 'pathe'
import defu from 'defu'
import { addPlugin, installModule, Nuxt } from '@nuxt/kit'
import chalk from 'chalk'
import type { Options as NuxtI18nOptions } from '@nuxtjs/i18n'
import languages from '../app/languages'
import { useDocusConfig } from './context'
import { resolveTemplateDir, resolveAppDir } from './dirs'

// Default i18n config
const i18nConfig: NuxtI18nOptions = {
  langDir: '',
  baseUrl: (nuxt: any) => nuxt.app?.$docus?.config?.value?.url || '',
  locales: [],
  defaultLocale: 'en',
  parsePages: false,
  lazy: true,
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
  const langDir = resolveAppDir('languages')

  // Update i18n langDir to relative from `~` (https://github.com/nuxt-community/i18n-module/blob/4bfa890ff15b43bc8c2d06ef9225451da711dde6/src/templates/utils.js#L31)
  i18nConfig.langDir = join(relative(nuxt.options.srcDir, langDir), '/')

  const config = useDocusConfig()

  // Inject Docus languages as #docus-i18n
  nuxt.options.alias['#docus-i18n'] = langDir

  // Try to parse available locales from contentDir
  try {
    if (!nuxt.options.i18n?.locales?.length) {
      const contentDir = resolve(nuxt.options.srcDir, config?.contentDir || 'content')
      const languageCodes = languages.map(({ code }: { code: string }) => code)
      const activeLanguages = fs.readdirSync(contentDir).filter(name => languageCodes.includes(name))
      activeLanguages.unshift(i18nConfig.defaultLocale as string)
      const localeCodes = [...new Set(activeLanguages)]

      // @ts-ignore
      i18nConfig.locales = languages.filter(language => localeCodes.includes(language.code))
    }
  } catch (e) {
    i18nConfig.locales = []
  }

  // Merge options
  nuxt.options.i18n = defu(nuxt.options.i18n, i18nConfig)

  // Add i18n plugin
  addPlugin(resolveTemplateDir('i18n.js'))

  // Add languages badge
  const localesList = i18nConfig.locales?.map(({ code }: any) => code).join(', ') || 'en'
  nuxt.options.cli.badgeMessages.push('', chalk.bold('📙 Languages: ') + chalk.underline.yellow(localesList))

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
  nuxt.hook('modules:done', nuxt => {
    nuxt.extendRoutes((routes: any[]) => {
      const index = routes.findIndex(route => route.path === '/*')
      const [all] = routes.splice(index, 1)
      routes.push(all)
    })
  })
}
