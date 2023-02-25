import { resolve } from 'pathe'
// import consola from 'consola'

const alias = {}

// if (process.env.NODE_ENV === 'development') {
//   consola.warn('Using local @nuxt/content!')
//   alias['@nuxt/content'] = '../src/module.ts'
// }

export default defineNuxtConfig({
  alias,
  app: {
    head: {
      script: [
        {
          defer: true,
          'data-domain': 'content.nuxtjs.org',
          src: 'https://plausible.io/js/script.js'
        }
      ]
    }
  },
  content: {
    sources: {
      v1: {
        prefix: '/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/en')
      },
      'v1-ja': {
        prefix: '/ja/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ja')
      },
      'v1-fr': {
        prefix: '/fr/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/fr')
      },
      'v1-ru': {
        prefix: '/ru/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ru')
      }
    },
    highlight: {
      preload: ['xml']
    }
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/blog/announcing-v2',
        // TODO: move to github module
        '/api/_github/releases/.json'
      ]
    }
  },
  modules: ['@nuxtlabs/github-module', '@nuxthq/studio'],
  extends: process.env.DOCUS_THEME_PATH || '@nuxt-themes/docus',
  github: {
    owner: 'nuxt',
    repo: 'content',
    branch: 'main'
  },
  colorMode: {
    preference: 'dark'
  },
  runtimeConfig: {
    content: {
      // @ts-ignore
      // TODO: fix types
      documentDriven: {
        host: 'https://content.nuxtjs.org'
      }
    },
    public: {
      algolia: {
        applicationId: '',
        apiKey: '',
        langAttribute: 'lang',
        docSearch: {
          indexName: 'content-nuxtjs'
        }
      }
    }
  }
})
