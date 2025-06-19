export default defineNuxtConfig({

  modules: ['@nuxtjs/plausible', '@vueuse/nuxt'],
  css: ['../app/assets/css/main.css'],
  site: {
    name: 'Nuxt Content',
  },
  future: {
    compatibilityVersion: 4,
  },
  llms: {
    domain: 'https://content.nuxt.com',
    title: 'Nuxt Content',
    description: 'Nuxt Content is a Git-based headless CMS for Nuxt',
    notes: [
      'The documentation only includes Nuxt Content v3 docs.',
      'The content is automatically generated from the same source as the official documentation.',
    ],
    full: {
      title: 'Complete Documentation',
      description: 'The complete documentation including all content',
    },
  },
})
