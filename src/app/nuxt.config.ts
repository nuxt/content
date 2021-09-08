import { resolve } from 'upath'
import { nuxtConfig } from 'nuxt-extend'
import { defineNuxtConfig } from '@nuxt/kit'
import { NuxtConfig } from '@nuxt/types'
const r = (path: any) => resolve(__dirname, path)

export default nuxtConfig(
  defineNuxtConfig({
    /**
     * Name for nuxt-extend
     */
    name: 'docus',

    /**
     * RootDir
     */
    rootDir: __dirname,

    /**
     * Default app config
     */
    head: {
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    },

    /**
     * Docus config
     */
    components: [
      {
        path: r('./components'),
        isAsync: false,
        prefix: '',
        level: 999
      }
    ],
    meta: {},

    /**
     * Disable suffix from color-mode
     */
    colorMode: {
      classSuffix: ''
    },

    /**
     * Modules & plugins
     */
    buildModules: [
      // Dependencies
      '@nuxtjs/pwa',
      '@nuxt/image',
      '@nuxtjs/composition-api/module',
      '@nuxt/postcss8',
      '@docus/core',
      // Local modules
      r('./index'),
      r('../settings'),
      r('../context')
    ],
    nitro: {
      inlineDynamicImports: true,
      externals: {
        inline: ['@docus/core', 'ohmyfetch', 'property-information'],
        external: [
          '@nuxtjs/composition-api',
          '@vue/composition-api',
          'vue-docgen-api',
          '@nuxt/kit',
          '@nuxt/image',
          '@nuxtjs/i18n',
          'vue-meta',
          'vue-router',
          'vue-i18n',
          'ufo',
          'vue-client-only',
          'vue-no-ssr',
          'ohmyfetch'
        ]
      }
    },
    modules: [r('../i18n')],

    /**
     * Build configs
     */
    target: 'static',
    server: {
      port: parseInt(process.env.PORT || '4000', 10)
    },
    // @ts-ignore
    vite: {
      // TODO: Remove that temporary fix.
      server: {
        fs: {
          strict: false
        }
      },
      // @ts-ignore
      experimentWarning: false,
      optimizeDeps: {
        exclude: ['ohmyfetch', 'vue-demi', 'scule', '@vueuse/integrations'],
        include: ['defu', 'theme-colors']
      }
    },
    typescript: {
      // TODO: Re-enable typeCheck
      // Waiting for better support from nuxt-vite / Nuxt 3
      typeCheck: false
    },
    generate: {
      fallback: '404.html',
      routes: ['/']
    },
    build: {
      transpile: ['@docus/', 'ohmyfetch', '@vue/composition-api']
    },
    image: {
      domains: ['https://i3.ytimg.com']
    }
  }) as NuxtConfig
)
