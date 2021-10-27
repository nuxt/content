import fs from 'fs'
import { resolve, join, relative } from 'pathe'
import defu from 'defu'
import { addPlugin, installModule, Nuxt, resolveModule } from '@nuxt/kit'
import languages from '../app/languages'
import { useDocusConfig } from './context'
import { resolveTemplateDir, resolveAppDir } from './dirs'

// Default i18n config
const config = {
  langDir: '',
  baseUrl: ({ $docus }: any) => ($docus && $docus.settings && $docus.settings.url) || '',
  locales: [],
  defaultLocale: 'en',
  parsePages: false,
  lazy: true,
  seo: false,
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
  config.langDir = join(relative(nuxt.options.srcDir, langDir), '/')

  const settings = useDocusConfig()

  // Inject Docus languages as #docus-i18n
  nuxt.options.alias['#docus-i18n'] = langDir

  // Try to parse available locales from contentDir
  try {
    if (!nuxt.options.i18n?.locales?.length) {
      const contentDir = resolve(nuxt.options.srcDir, settings?.contentDir || 'content')
      const languageCodes = languages.map(({ code }: { code: string }) => code)
      const activeLanguages = fs.readdirSync(contentDir).filter(name => languageCodes.includes(name))
      activeLanguages.unshift(config.defaultLocale)
      const localeCodes = [...new Set(activeLanguages)]

      // @ts-ignore
      config.locales = languages.filter(language => localeCodes.includes(language.code))
    }
  } catch (e) {
    config.locales = []
  }

  // Merge optionos
  nuxt.options.i18n = defu(nuxt.options.i18n, config)

  // Add i18n plugin
  addPlugin(resolveTemplateDir('i18n.js'))

  // Install i18n module
  await installModule(nuxt, {
    src: resolveModule('@nuxtjs/i18n')
  })

  // @ts-ignore - Get available locales and set default locale
  nuxt.hook('docus:context', docusContext => {
    const codes = nuxt.options.i18n?.locales.map((locale: any) => locale.code || locale)
    docusContext.locales.codes = codes || docusContext.locales.codes
    docusContext.locales.defaultLocale = nuxt.options.i18n?.defaultLocale || docusContext.locales.defaultLocale
  })
}
