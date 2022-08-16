import { defineTransformer } from '@nuxt/content/transformers'

export default defineTransformer({
  name: 'my-transformer',
  extensions: ['.names'],
  parse (_id, rawContent) {
    return {
      _id,
      body: rawContent.trim().split('\n').map(line => line.trim()).sort()
    }
  }
})
