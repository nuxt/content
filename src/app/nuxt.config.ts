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
  components: true,
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
    '@docus/core/module',
    // Local modules
    r('./module'),
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
  vite: {
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
  image: {
    domains: ['https://i3.ytimg.com']
  }
})
