const QueryBuilder = require('./QueryBuilder')

export default (ctx, inject) => {
  const $content = function () {
    const path = Array.from(arguments).join('/').replace(/\/+/g, '/')

    return new QueryBuilder(`/<%= options.apiPrefix %>/${path}`)
  }

  inject('content', $content)
  ctx.$content = $content

    <% if (options.watch) { %>
  if (process.client) {
        window.onNuxtReady(async (app) => {
          const sse = new EventSource('<%= options.apiPrefix %>/sse')

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
      }
  <% } %>
}
