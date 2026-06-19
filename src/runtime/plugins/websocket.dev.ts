import { defineNuxtPlugin } from 'nuxt/app'
import { refreshNuxtData } from '#imports'

interface ContentUpdate { collection: string, key: string, queries: string[] }
interface AssetUpdate { event: 'update' | 'remove', src: string, width?: number, height?: number }

interface ContentHot {
  on(event: 'nuxt-content:update', callback: (data: ContentUpdate) => void): void
  on(event: 'nuxt-content:assets:update', callback: (data: AssetUpdate) => void): void
}

export default defineNuxtPlugin(() => {
  if (!import.meta.hot || !import.meta.client) return

  const hot = import.meta.hot as unknown as ContentHot

  import('../internal/database.client').then(({ loadDatabaseAdapter }) => {
    hot.on('nuxt-content:update', async (data) => {
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

  hot.on('nuxt-content:assets:update', (data) => {
    if (!data || !data.src) return
    const isUpdate = data.event === 'update'
    const { src, width, height } = data
    const safeSrc = src.replace(/["\\]/g, '\\$&')
    document
      .querySelectorAll(`:is(img, video, source, embed, iframe):where([src^="${safeSrc}"])`)
      .forEach((node) => {
        const element = node as HTMLImageElement
        element.style.opacity = isUpdate ? '1' : '0.2'
        if (!isUpdate) return

        const params = new URLSearchParams(element.getAttribute('src')!.split('?')[1] || '')
        params.set('time', String(Date.now()))

        if (width && height) {
          element.addEventListener('load', function onLoad() {
            if (element.width && element.height) {
              element.setAttribute('width', String(width))
              element.setAttribute('height', String(height))
            }
            if (element.style.aspectRatio) {
              element.style.aspectRatio = `${width} / ${height}`
            }
            element.removeEventListener('load', onLoad)
          })
        }

        element.setAttribute('src', `${src}?${params.toString()}`)
      })
  })
})
