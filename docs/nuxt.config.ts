import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxtjs/plausible', '@vueuse/nuxt', '@nuxthub/core', 'nuxt-studio'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Nuxt Content',
    url: 'https://content.nuxt.com',
  },
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        highlight: {
          langs: ['docker'],
        },
      },
    },
  },
  routeRules: {
    ...(readFileSync(resolve(__dirname, '_redirects'), 'utf-8'))
      .split('\n')
      .filter(line => line.trim().length && !line.trim().startsWith('#'))
      .reduce((acc, line) => {
        const [from, to] = line.split('=') as [string, string]
        return Object.assign(acc, { [from]: { redirect: to } })
      }, {} as Record<string, { redirect: string }>),
  },
  nitro: {
    compatibilityDate: {
      // Don't generate observability routes
      vercel: '2025-07-14',
    },
  },
  hub: {
    database: 'sqlite',
    cache: true,
  },
  llms: {
    domain: 'https://content.nuxt.com',
    title: 'Nuxt Content',
    description: 'Nuxt Content is a Git-based headless CMS for Nuxt',
    notes: [
      'The documentation only includes Nuxt Content v3 docs.',
      'The content is automatically generated from the same source as the official documentation.',
    ],
    full: {
      title: 'Complete Documentation',
      description: 'The complete documentation including all content',
    },
  },
  studio: {
    route: '/admin',
    repository: {
      owner: 'nuxt',
      repo: 'content',
      branch: 'feat/new-studio-module',
      rootDir: 'docs',
    },
  },
})
