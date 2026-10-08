// A docs layer: it registers Nuxt Content and ships its own `content.config.ts`,
// which declares the `docs` and `landing` collections for the consuming project.
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    v3Composables: true,
  },
})
