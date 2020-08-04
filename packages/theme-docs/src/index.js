import path from 'path'
import defu from 'defu'

const defaultConfig = {
  target: 'static',
  ssr: true,
  srcDir: __dirname,
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  transpile: [
    __dirname // transpile node_modules/@nuxt/content-theme-docs
  ],
  css: [
    '~/assets/css/main.css'
  ],
  plugins: [
    '@/plugins/markdown',
    '@/plugins/init',
    '@/plugins/i18n.client',
    '@/plugins/vue-scrollactive',
    '@/plugins/menu.client'
  ],
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/pwa',
    '@nuxtjs/google-fonts'
  ],
  modules: [
    'nuxt-i18n',
    '@nuxt/content'
  ],
  components: true,
  hooks: {
    'modules:before': ({ nuxt }) => {
      // Configure `content/` dir
      nuxt.options.content.dir = path.resolve(nuxt.options.rootDir, nuxt.options.content.dir || 'content')
      // Configure `static/ dir
      nuxt.options.dir.static = path.resolve(nuxt.options.rootDir, 'static')
      // Configure `components/` dir
      nuxt.hook('components:dirs', (dirs) => {
        dirs.push({
          path: path.resolve(nuxt.options.rootDir, 'components/global'),
          global: true
        })
      })
    }
  },
  content: {
    markdown: {
      prism: {
        theme: 'prism-themes/themes/prism-material-oceanic.css'
      }
    }
  },
  i18n: {
    locales: [{
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en',
    parsePages: false,
    lazy: true,
    seo: false,
    langDir: 'i18n/'
  },
  googleFonts: {
    families: {
      'DM+Sans': true,
      'DM+Mono': true
    }
  }
}

export default (userConfig) => {
  const config = defu.arrayFn(userConfig, defaultConfig)

  config.hooks['content:file:beforeInsert'] = (document) => {
    const regexp = new RegExp(`^/(${config.i18n.locales.map(locale => locale.code).join('|')})`, 'gi')
    const dir = document.dir.replace(regexp, '')
    const slug = document.slug.replace(/^index/, '')

    document.to = `${dir}/${slug}`
  }

  return config
}
