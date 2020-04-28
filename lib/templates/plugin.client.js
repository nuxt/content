import Vue from 'vue'
import NuxtContent from './nuxt-content'
import QueryBuilder from './query-builder'

Vue.component(NuxtContent.name, NuxtContent)

export default (ctx, inject) => {
  const $content = function () {
    const path = Array.from(arguments).join('/').replace(/\/+/g, '/')

    return new QueryBuilder(`/<%= options.apiPrefix %>/${path}`)
  }

  inject('content', $content)
  ctx.$content = $content

  <% if (options.watch) { %>
  const log = console.log.bind(console, '[@nuxtjs/content]')
  const warn = console.warn.bind(console, '[@nuxtjs/content]')
  if (!window.WebSocket) {
    warn('[@nuxtjs/content] Could not activate hot reload, your browser does not support WebSocket.')
    return
  }
  let ws = null
  let app = null
  window.onNuxtReady((_app) => {
    app = _app
  })
  const wsMessage = async function (message) {
    try {
      const data = JSON.parse(message.data)
      if (!data) {
        return
      }
      if (app.$store && app.$store._actions.nuxtServerInit) {
        await app.$store.dispatch('nuxtServerInit', app.$options.context)
      }
      app.refresh()
    } catch (err) { }
  }
  const wsOpen = () => log('WS connected')
  const wsError = function (e) {
    switch (e.code) {
      case 'ECONNREFUSED':
        wsConnect(true)
        break
      default:
        warn('WS Error:', e)
        break
    }
  }
  const wsClose = function (e) {
    // https://tools.ietf.org/html/rfc6455#section-11.7
    if (e.code === 1000 || e.code === 1005) {
      // Normal close
      log('WS closed!')
    } else {
      // Unkown error
      wsConnect(true)
    }
  }
  const wsConnect = function (retry) {
    if (retry) {
      log('WS reconnecting...')
      setTimeout(wsConnect, 1000)
      return
    }
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const wsPath = '/<%= options.apiPrefix %>/ws'
    const wsURL = `${protocol}://${location.hostname}:${location.port}${wsPath}`
    log(`WS connect to ${wsURL}`)
    ws = new WebSocket(wsURL)
    ws.onopen = wsOpen
    ws.onmessage = wsMessage
    ws.onerror = wsError
    ws.onclose = wsClose
  }
  wsConnect()
  <% } %>
}
