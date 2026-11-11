export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  devtools: { enabled: true },
  content: {
    // Expose the Content v3 API (`queryCollection`, `queryCollectionNavigation`, …)
    compatibilityVersion: 3,
  },
  compatibilityDate: 'latest',
})
