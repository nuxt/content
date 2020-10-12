import path from 'path'
import defu from 'defu'

import tailwindConfig from './tailwind.config'

const defaultConfig = docsOptions => ({
  target: 'static',
  ssr: true,
  srcDir: __dirname,
  privateRuntimeConfig: {
    githubToken: process.env.GITHUB_TOKEN
  },
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  generate: {
    fallback: '404.html',
    routes: ['/']
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
  loading: {
    color: docsOptions.primaryColor
  },
  meta: {
    theme_color: docsOptions.primaryColor
  },
  hooks: {
    'modules:before': ({ nuxt }) => {
      // Configure `content/` dir
      nuxt.options.content.dir = path.resolve(nuxt.options.rootDir, nuxt.options.content.dir || 'content')
      // Configure `static/ dir
      nuxt.options.dir.static = path.resolve(nuxt.options.rootDir, nuxt.options.dir.static || 'static')
      // Configure `components/` dir
      nuxt.hook('components:dirs', (dirs) => {
        dirs.push({
          path: path.resolve(nuxt.options.rootDir, 'components/global'),
          global: true
        })
      })
      // Configure `tailwind.config.js` path
      nuxt.options.tailwindcss.configPath = nuxt.options.tailwindcss.configPath || path.resolve(nuxt.options.rootDir, 'tailwind.config.js')
      nuxt.options.tailwindcss.cssPath = nuxt.options.tailwindcss.cssPath || path.resolve(nuxt.options.rootDir, nuxt.options.dir.assets, 'css', 'tailwind.css')
      // Extend `/` route
      nuxt.hook('build:extendRoutes', (routes) => {
        const allRoute = routes.find(route => route.name === 'all')

        routes.push({
          ...allRoute,
          path: '/',
          name: 'index'
        })
      })
      // Override editor style on dev mode
      if (nuxt.options.dev) {
        nuxt.options.css.push(path.resolve(__dirname, 'assets/css/main.dev.css'))
      }
      // Configure TailwindCSS
      nuxt.hook('tailwindcss:config', function (defaultTailwindConfig) {
        Object.assign(defaultTailwindConfig, defu(defaultTailwindConfig, tailwindConfig({ docsOptions, nuxt })))
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
  },
  tailwindcss: {}
})

export default (userConfig) => {
  const docsOptions = defu(userConfig.docs, {
    primaryColor: undefined
  })

  const config = defu.arrayFn(userConfig, defaultConfig(docsOptions))

  if (userConfig.env && userConfig.env.GITHUB_TOKEN) {
    // eslint-disable-next-line no-console
    console.warn('[security] Avoid passing `env.GITHUB_TOKEN` directly in `nuxt.config`. Use `.env` file instead!')
    userConfig.privateRuntimeConfig.GITHUB_TOKEN = userConfig.env.GITHUB_TOKEN
    delete userConfig.env.GITHUB_TOKEN
  }

  config.hooks['content:file:beforeInsert'] = (document) => {
    const regexp = new RegExp(`^/(${config.i18n.locales.map(locale => locale.code).join('|')})`, 'gi')
    const dir = document.dir.replace(regexp, '')
    const slug = document.slug.replace(/^index/, '')

    document.to = `${dir}/${slug}`
  }

  return config
}
