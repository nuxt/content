import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  window.benchmark = {
    downloadCompressedDump: true,
    cacheInLocalStorage: true,
    reinitiateDatabase: true,
  }
})
