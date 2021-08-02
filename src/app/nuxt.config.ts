import { resolve } from 'upath'
import { nuxtConfig } from 'nuxt-extend'

const r = (path: any) => resolve(__dirname, path)

export default nuxtConfig({
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
      level: 2
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
    'nuxt-vite',
    '@nuxtjs/pwa',
    '@nuxt/image',
    '@nuxtjs/composition-api/module',
    '@nuxt/postcss8',
    '@docus/core',
    // Local modules
    r('./index'),
    r('../settings'),
    r('../context')
    // r('../social-image'),
    // r('../twitter'),
    // r('../github')
  ],
  modules: [r('../i18n')],

  /**
   * Build configs
   */
  target: 'static',
  server: {
    port: process.env.PORT || 4000
  },
  // @ts-ignore
  vite: {
    // TODO: Remove that temporary fix.
    server: {
      fs: {
        strict: false
      }
    },
    experimentWarning: false,
    optimizeDeps: {
      exclude: ['ohmyfetch', 'vue-demi', 'scule', '@vueuse/integrations'],
      include: ['defu', 'theme-colors', 'cookie', 'js-cookie', 'clipboard', 'property-information']
    }
  },
  typescript: {
    // TODO: Re-enable typeCheck
    // Waiting for better support from nuxt-vite / nuxt 3
    typeCheck: false
  },
  generate: {
    fallback: '404.html',
    routes: ['/']
  },
  build: {
    transpile: ['@docus/', 'ohmyfetch']
  },
  image: {
    domains: ['https://i3.ytimg.com']
  }
})
