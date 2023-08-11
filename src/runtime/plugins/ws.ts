import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  if (process.client && import.meta.hot) {
    import.meta.hot.on('content:updated', () => {
      refreshNuxtData()
    })
  }
})
