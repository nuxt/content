import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
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
