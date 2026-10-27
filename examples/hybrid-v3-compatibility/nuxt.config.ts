export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  devtools: { enabled: true },
  content: {
    // Browser navigations query the prerendered snapshot locally (SQLite WASM)
    // instead of calling the server.
    mode: 'hybrid',
    // Expose the Content v3 API (`queryCollection`, `queryCollectionNavigation`, …)
    v3Composables: true,
  },
  compatibilityDate: 'latest',
})
