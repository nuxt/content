import { defineNuxtPlugin } from '#imports'
import type { Plugin } from 'nuxt/app'

const previewPlugin: Plugin = defineNuxtPlugin(async () => {
  return {
    provide: {
      content: {
        loadLocalDatabase: () => {
          return import('../internal/database.client').then(m => m.loadDatabaseAdapter)
        },
      },
    },
  }
})

export default previewPlugin
