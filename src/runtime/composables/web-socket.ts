import { useRuntimeConfig } from '#app'
import { refreshNuxtData } from '#imports'

const logger = {
  // eslint-disable-next-line no-console
  log: (...args: any[]) => console.log('[Content]', ...args),
  // eslint-disable-next-line no-console
  warn: (...args: any[]) => console.warn('[Content]', ...args)
}

let ws: WebSocket | undefined

export function useContentWebSocket () {
  if (!window.WebSocket) {
    logger.warn('Could not enable hot reload, your browser does not support WebSocket.')
    return
  }

  const onMessage = (message: any) => {
    try {
      const data = JSON.parse(message.data)

      if (!data) { return }

      refreshNuxtData()
    } catch (err) {}
  }

  const onOpen = () => logger.log('WS connected!')

  const onError = (e: any) => {
    switch (e.code) {
      case 'ECONNREFUSED':
        connect(true)
        break
      default:
        logger.warn('WS Error:', e)
        break
    }
  }

  const onClose = (e: any) => {
    // https://tools.ietf.org/html/rfc6455#section-11.7
    if (e.code === 1000 || e.code === 1005) {
      // Normal close
      logger.log('WS closed!')
    } else {
      // Unkown error
      connect(true)
    }
  }

  const connect = (retry = false) => {
    if (retry) {
      logger.log('WS reconnecting..')
      setTimeout(connect, 1000)
      return
    }

    if (ws) {
      try {
        ws.close()
      } catch (err) {}
      ws = undefined
    }

    // WebSocket Base URL
    const wsURL = `${useRuntimeConfig().public.content.wsUrl}ws`

    logger.log(`WS connect to ${wsURL}`)

    ws = new WebSocket(wsURL)
    ws.onopen = onOpen
    ws.onmessage = onMessage
    ws.onerror = onError
    ws.onclose = onClose
  }

  // automatically connect on use
  connect()

  return {
    connect
  }
}
