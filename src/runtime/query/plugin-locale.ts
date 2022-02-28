import { QueryBuilder } from '../types'
import { defineQueryPlugin } from '.'

export interface Queries {
  locale(string): QueryBuilder
}

export default defineQueryPlugin({
  name: 'locale',
  queries: params => ({
    locale (locale: string) {
      params.locale = locale
    }
  }),
  execute: (data, params) => {
    if (params.locale) {
      return data.filter(item => item.locale === params.locale)
    }
    return data
  }
})
