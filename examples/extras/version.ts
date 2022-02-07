import type { QueryBuilder } from '../../src/runtime/types'
import { defineQueryPlugin } from '../../src/runtime/query'

export interface Queries<T> {
  version(v: string): QueryBuilder<T>
}

export default defineQueryPlugin({
  name: 'version',
  queries: {
    version: (params) => {
      return (v) => {
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
