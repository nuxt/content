import { UButton } from '#components'

export default defineNuxtPlugin((nuxtApp) => {
  // Set the button as global to use in Markdown
  nuxtApp.vueApp.component('UButton', UButton)
})
