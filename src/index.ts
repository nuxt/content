import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'docus',
    compatibility: {
      nuxt: '>=3.0.0',
      bridge: true
    },
    version: '3',
    configKey: 'docus'
  },
  setup(options, nuxt) {
    console.log({ options, nuxt })

    console.log('Hello World!')
  }
})
