import fs from 'fs'
import { resolve, join, relative } from 'upath'
import defu from 'defu'
import { Module } from '@nuxt/types'
// @ts-ignore
import languages from './languages'

const r = (...args: string[]) => resolve(__dirname, ...args)

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

export default <Module>function docusI18n() {
  const { requireModule, addPlugin, nuxt, $docus } = this
  const { options } = nuxt

  // Update i18n langDir to relative from `~` (https://github.com/nuxt-community/i18n-module/blob/4bfa890ff15b43bc8c2d06ef9225451da711dde6/src/templates/utils.js#L31)
  config.langDir = join(relative(options.srcDir, r('languages')), '/')

  // Inject Docus theme as ~docus
  options.alias['~docus-i18n'] = r('languages')

  // Try to parse available locales from contentDir
  try {
    if (!options.i18n?.locales?.length) {
      const contentDir = resolve(options.srcDir, $docus.settings.contentDir)
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

  options.i18n = defu(options.i18n, config)

  nuxt.hook('build:before', () => {
    addPlugin({
      src: r('../templates/docus.js'),
      filename: 'docus-i18n.js'
    })

    requireModule('nuxt-i18n')

    /**
     * Temporary fix
     * This should be done by nuxt-i18n
     */
    this.extendRoutes((routes: any[]) => {
      // move start route to the end
      const index = routes.findIndex(route => route.path === '/*')
      const [all] = routes.splice(index, 1)
      routes.push(all)
    })
  })
}
