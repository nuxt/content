import Vue from 'vue'
import NuxtContent from './nuxt-content'
import QueryBuilder from './query-builder'
import database from './db'
import Loki from '@lokidb/loki'
import LokiFullTextSearch from '@lokidb/full-text-search'

LokiFullTextSearch.register()

Vue.component('NuxtContent', NuxtContent)
Vue.component('NContent', NuxtContent)

export default (ctx, inject) => {
  const dirs = <%= JSON.stringify(options.dirs) %>
  const db = new Loki('content.db')
  db.loadJSONObject(database)

  const items = db.getCollection('items')

  const $content = function () {
    const path = `/${Array.from(arguments).join('/').replace(/\/+/g, '/')}`
    const isDir = !path || !!dirs.find(dir => dir === path)
    // Look for dir or path
    const query = isDir ? { dir: path } : { path }
    // Postprocess to get only first result (findOne)
    const postprocess = isDir ? [] : [data => data[0]]

    return new QueryBuilder({
      query: items.chain().find(query, !isDir),
      postprocess
    }, {
      fullTextSearchFields: <%= JSON.stringify(options.fullTextSearchFields) %>
    })
  }

  inject('content', $content)
  ctx.$content = $content
}
