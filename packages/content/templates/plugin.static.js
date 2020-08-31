import Vue from 'vue'
import NuxtContent from './nuxt-content'
const loadContent = () =>
  import('./plugin.client.lazy' /* webpackChunkName: "content/plugin.js" */)

Vue.component(NuxtContent.name, NuxtContent)

export default (ctx, inject) => {
  let $$content = null
  const { dbHash } = ctx.$config ? ctx.$config.content : ctx.nuxtState.content
  const $content = (...contentArgs) => {
    if ($$content) {
      return $$content(...contentArgs)
    }
    const keys = [
      'only',
      'without',
      'sortBy',
      'limit',
      'skip',
      'where',
      'search',
      'surround'
    ]
    const mock = {}
    const toCall = []
    for (const key of keys) {
      mock[key] = (...args) => {
        toCall.push({ key, args })
        return mock
      }
    }
    mock.fetch = async () => {
      const database = await fetch(
        `<%= options.dbPath %>/db-${dbHash}.json`
      ).then(res => res.json())
      $$content = (await loadContent()).default(database)
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
