export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  devtools: { enabled: true },
  content: {
    // Expose the Content v3 API (`queryCollection`, `queryCollectionNavigation`, …)
    v3Compatibility: true,
  },
  compatibilityDate: 'latest',
})
