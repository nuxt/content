import { defineQueryPlugin } from '#docus'

export default defineQueryPlugin({
  name: 'version',
  queries: {
    version: params => {
      return v => {
        params.version = v
      }
    }
  },
  execute: (data, params) => {
    if (params.version) {
      return data.filter(v => v.version === params.version)
    }
  }
})
