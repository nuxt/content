import Vue from 'vue'
import NuxtContent from './nuxt-content'
import QueryBuilder from './query-builder'
const logger = require('consola').withScope('@nuxt/content')

Vue.component(NuxtContent.name, NuxtContent)

export default (ctx, inject) => {
  const $content = function () {
    const path = Array.from(arguments).join('/').replace(/\/+/g, '/')

    return new QueryBuilder(`/<%= options.apiPrefix %>/${path}`)
  }

  inject('content', $content)
  ctx.$content = $content

    <% if (options.watch) { %>
  if (!window.WebSocket) {
        logger.warn('[@nuxt/content] Could not activate hot reload, your browser does not support WebSocket.')
        return
      }
      let ws = null
      let $nuxt = null
      window.onNuxtReady((_nuxt) => {
        $nuxt = _nuxt
      })
      const wsMessage = async function (message) {
        try {
          const data = JSON.parse(message.data)
          if (!data) {
            return
          }
          $nuxt.$emit('content:update', data)
          // Nuxt3: await $nuxt.callHook('content:update')
          if ($nuxt.$store && $nuxt.$store._actions.nuxtServerInit) {
            await $nuxt.$store.dispatch('nuxtServerInit', $nuxt.$options.context)
          }
          $nuxt.refresh()
        } catch (err) { }
      }
      const wsOpen = () => logger.log('WS connected')
      const wsError = function (e) {
        switch (e.code) {
          case 'ECONNREFUSED':
            wsConnect(true)
            break
          default:
            logger.warn('WS Error:', e)
            break
        }
      }
      const wsClose = function (e) {
        // https://tools.ietf.org/html/rfc6455#section-11.7
        if (e.code === 1000 || e.code === 1005) {
          // Normal close
          logger.log('WS closed!')
        } else {
          // Unkown error
          wsConnect(true)
        }
      }
      const wsConnect = function (retry) {
        if (retry) {
          logger.log('WS reconnecting...')
          setTimeout(wsConnect, 1000)
          return
        }
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
        const wsPath = '/<%= options.apiPrefix %>/ws'
        const wsURL = `${protocol}://${location.hostname}:${location.port}${wsPath}`
        logger.log(`WS connect to ${wsURL}`)
        ws = new WebSocket(wsURL)
        ws.onopen = wsOpen
        ws.onmessage = wsMessage
        ws.onerror = wsError
        ws.onclose = wsClose
      }
      wsConnect()
        <% } %>
}
