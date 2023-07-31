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
  // @ts-ignore
  modules: [contentModule],
  content: {
    sources: [
      {
        name: 'github',
        prefix: '/',
        driver: resolve('drivers', 'github.mjs'),
        repo: 'nuxt/content',
        branch: 'main',
        dir: '/test/fixtures/basic/content'
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
          emoticon: true
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
