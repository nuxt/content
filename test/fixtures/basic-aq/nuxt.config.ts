import { resolve } from 'pathe'
import contentModule from '../../..'

export default defineNuxtConfig({
  nitro: {
    plugins: [
      '~/addons/nitro-plugin.ts'
    ]
  },
  components: {
    dirs: [
      {
        path: resolve(__dirname, './components'),
        global: true
      },
      {
        path: resolve(__dirname, './content'),
        global: true,
        pathPrefix: false,
        prefix: ''
      }
    ]
  },
  modules: [contentModule],
  content: {
    experimental: {
      advanceQuery: true
    },
    locales: ['fa', 'en'],
    defaultLocale: 'en',
    sources: [
      {
        name: 'fa-ir',
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa')
      }
    ],
    ignores: ['.*\\.vue'],
    navigation: {
      fields: ['icon']
    },
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      }
    },
    markdown: {
      // Object syntax can be used to override default options
      remarkPlugins: {
        // override remark-emoji options
        'remark-emoji': {
          emoticon: false
        },
        // disable remark-gfm
        'remark-gfm': false,
        // add remark-oembed
        'remark-oembed': {}
      },
      // Array syntax can be used to add plugins
      rehypePlugins: [
        'rehype-figure',
        ['rehype-wrap-all', [{ selector: 'ol', wrapper: 'p' }, { selector: 'ul', wrapper: 'p' }]]
      ]
    }
  }
})
