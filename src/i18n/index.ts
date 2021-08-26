import fs from 'fs'
import { resolve, join, relative } from 'upath'
import defu from 'defu'
import { addPlugin, defineNuxtModule, installModule, Nuxt, resolveModule } from '@nuxt/kit'
import { useDocusSettings } from '../settings/useDocusSettings'
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

export default defineNuxtModule({
  async setup(_moduleOptions: any, nuxt: Nuxt) {
    // Update i18n langDir to relative from `~` (https://github.com/nuxt-community/i18n-module/blob/4bfa890ff15b43bc8c2d06ef9225451da711dde6/src/templates/utils.js#L31)
    config.langDir = join(relative(nuxt.options.srcDir, r('languages')), '/')

    const settings = useDocusSettings()

    // Inject Docus theme as ~docus
    nuxt.options.alias['~docus/i18n'] = r('languages')

    // Try to parse available locales from contentDir
    try {
      if (!nuxt.options.i18n?.locales?.length) {
        const contentDir = resolve(nuxt.options.srcDir, settings.contentDir)
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

    nuxt.options.i18n = defu(nuxt.options.i18n, config)

    // Add i18n plugin
    addPlugin(r('../templates/i18n.js'))

    // install i18n module
    await installModule(nuxt, {
      src: resolveModule('@nuxtjs/i18n')
    })

    nuxt.hook('build:before', () => {
      /**
       * Temporary fix
       * This should be done by @nuxtjs/i18n
       */
      // extendRoutes((routes: any[]) => {
      //   // move start route to the end
      //   const index = routes.findIndex(route => route.path === '/*')
      //   const [all] = routes.splice(index, 1)
      //   const codes = nuxt.options.i18n.locales
      //     .map((l: any) => l.code || l)
      //     .filter((code: string) => code !== nuxt.options.i18n.defaultLocale)
      //   for (const code of codes) {
      //     routes.push({
      //       ...all,
      //       path: '/' + code,
      //       name: 'index___' + code
      //     })
      //   }
      //   routes.push(all)
      // })
    })
  }
})
