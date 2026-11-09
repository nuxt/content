export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  devtools: { enabled: true },
  content: {
    // Browser navigations read the prerendered snapshot instead of calling the server.
    mode: 'hybrid',
    // Pure v4: use the `content` instance directly, without the v3 query composables.
    v3Compatibility: false,
  },
  compatibilityDate: 'latest',
})
