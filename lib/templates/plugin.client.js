import Vue from 'vue'
import NuxtContent from './nuxt-content'
import QueryBuilder from './query-builder'

Vue.component('NuxtContent', NuxtContent)
Vue.component('NContent', NuxtContent)

export default (ctx, inject) => {
  const $content = function () {
    const path = Array.from(arguments).join('/').replace(/\/+/g, '/')

    return new QueryBuilder(`/<%= options.apiPrefix %>/${path}`)
  }

  inject('content', $content)
  ctx.$content = $content

    <% if (options.watch) { %>
      window.onNuxtReady(async (app) => {
        const sse = new EventSource('/<%= options.apiPrefix %>/sse')

        sse.addEventListener('message', async message => {
          try {
            const data = JSON.parse(message.data)
            if (data && data.event !== 'change') {
              return
            }
            app.refresh()
          } catch (err) { }
        })
      })
      <% } %>
}
