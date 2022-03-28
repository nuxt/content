import NuxtLink from '#app/components/nuxt-link'

/**
 * This solution is temporary.
 * It comes as a workaround the fact that the NuxtLink component is not registered globally while we need it to be inside for it to be rendered with MDC.
 */

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NuxtLink', NuxtLink)
})
