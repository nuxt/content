import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'
import { DEVTOOLS_UI_PORT } from '../src/constants'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxthub/core',
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev)
          return

        startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', DEVTOOLS_UI_PORT.toString()],
            cwd: resolve(__dirname, '../src/devtools/client'),
          },
          {
            id: 'nuxt-devtools-content:client',
            name: 'Nuxt DevTools Content Client',
          },
        )
      },
    }),
  ],
  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-code-import': {},
        },
        highlight: {
          theme: {
            dark: 'aurora-x', // Theme containing italic
            default: 'github-light',
          },
        },
      },
    },
  },
  mdc: {
    highlight: {
      theme: {
        light: 'material-theme-lighter',
        default: 'material-theme',
        dark: 'material-theme-palenight',
      },
    },
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
