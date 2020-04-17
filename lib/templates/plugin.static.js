import Vue from 'vue'
import NuxtContent from './nuxt-content'
const loadContent = () =>
  import('./plugin.client.lazy' /* webpackChunkName: "content/plugin.js" */)

Vue.component(NuxtContent.name, NuxtContent)

export default (ctx, inject) => {
  let $$content = null

  let $content = (...contentArgs) => {
    if ($$content) {
      return $$content(...contentArgs)
    }
    const keys = [
      'fields',
      'sortBy',
      'limit',
      'skip',
      'where',
      'search',
      'surround'
    ]
    const mock = {}
    let toCall = []
    for (const key of keys) {
      mock[key] = (...args) => {
        toCall.push({ key, args })
        return mock
      }
    }
    mock.fetch = async () => {
      /* TODO:
        {{ distDir? }}/content/db.json
        const db = fetch('/_nuxt/content/db.json).then(res => res.json())

        $$content = (await loadContent()).default(db)
      */
      $$content = (await loadContent()).default

      let query = $$content(...contentArgs)
      toCall.forEach(({ key, args }) => {
        query = query[key](...args)
      })
      return query.fetch()
    }

    return mock
  }
  inject('content', $content)
  ctx.$content = $content
}
