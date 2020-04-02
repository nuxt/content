export default (ctx, inject) => {
  if (process.client && process.static) {
    return
  }

  const $content = function (dir = '', path = '') {
    if (dir && !path) {
      path = dir
      dir = ''
    }
    path = `/${dir}/${path}`.replace(/\/+/g, '/')

    if (process.server) {
      return ctx.req.database.query(path)
    }

    return {
      data () {
        return fetch('<%= options.url %>' + path).then((response) => {
          if (!response.ok) {
            const error = new Error(response.statusText)
            error.response = response
            throw error
          }
          return response.json()
        })
      }
    }
  }

  inject('content', $content)
  ctx.$content = $content

    <% if (options.watch) { %>
  if (process.client) {
        window.onNuxtReady(async (app) => {
          const sse = new EventSource('<%= options.url %>/sse')

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
