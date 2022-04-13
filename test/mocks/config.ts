import nuxtConfig from '../fixtures/basic/nuxt.config'

export const useRuntimeConfig = () => ({
  content: {
    ...nuxtConfig.content,
    ignores: []
  }
})
