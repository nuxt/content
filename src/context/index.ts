import { resolve } from 'upath'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup(_options, nuxt) {
    nuxt.options.alias['~docus/context'] = resolve(__dirname, 'runtime')
  }
})
