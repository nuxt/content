import { defineNuxtPlugin } from 'nuxt/app'
import { refreshNuxtData } from '#imports'

type HotEvent = (event: 'nuxt-content:update', callback: (data: { collection: string, key: string, queries: string[] }) => void) => void
export default defineNuxtPlugin(() => {
  if (!import.meta.hot || !import.meta.client) return

  import('../internal/database.client').then(({ loadDatabaseAdapter }) => {
    ;(import.meta.hot as unknown as { on: HotEvent }).on('nuxt-content:update', async (data) => {
      if (!data || !data.collection || !Array.isArray(data.queries)) return
      try {
        const db = await loadDatabaseAdapter(data.collection)
        for (const sql of data.queries) {
          try {
            await db.exec(sql)
          }
          catch (err) {
            console.log(err)
          }
        }
        refreshNuxtData()
      }
      catch {
        // ignore
      }
    })
  })
})
