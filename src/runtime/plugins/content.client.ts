import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      content: {
        loadLocalDatabase: (collection: string) => {
          return import('../internal/database.client')
            .then(({ loadDatabaseAdapter }) => loadDatabaseAdapter(collection))
        },
      },
    },
  }
})
