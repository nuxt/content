import { ExampleLandingHero, PreviewCard } from '#components'

// Fix error on components not found in landing page
// maybe because it's within a .yml file?
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ExampleLandingHero', ExampleLandingHero)
  nuxtApp.vueApp.component('PreviewCard', PreviewCard)
})
