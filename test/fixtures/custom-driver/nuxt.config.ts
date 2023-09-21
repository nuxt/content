import { pathToFileURL } from 'url'
import { resolve } from 'pathe'
import contentModule from '../../..'
// import customDriver from './drivers/github.mjs'
// resolve('drivers', 'github.mjs')

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
    sources: {
      github: {
        prefix: '/',
        driver: process.env.NODE_ENV === 'development' ? pathToFileURL(resolve(__dirname, 'drivers', 'github.mjs')).href : resolve(__dirname, 'drivers', 'github.mjs'),
        repo: 'nuxt/content',
        branch: 'main',
        dir: '/test/fixtures/basic/content'
      }
    },
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
