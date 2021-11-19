const logger = {
  // eslint-disable-next-line no-console
  log: (...args: any[]) => console.log('[Docus]', ...args),
  // eslint-disable-next-line no-console
  warn: (...args: any[]) => console.warn('[Docus]', ...args)
}

let $nuxt: any

let ws = null

export function useWebSocket(base: string) {
  if (!window.WebSocket) {
    logger.warn('Could not activate hot reload, your browser does not support WebSocket.')
    return
  }

  // @ts-ignore
  window.onNuxtReady(_nuxt => {
    $nuxt = _nuxt
  })

  const onMessage = async (message: any) => {
    try {
      const data = JSON.parse(message.data)

      if (!data) return

      $nuxt.$emit('content:update', data)

      // Nuxt3: await $nuxt.callHook('content:update')

      if ($nuxt.$store && $nuxt.$store._actions.nuxtServerInit) {
        await $nuxt.$store.dispatch('nuxtServerInit', $nuxt.$options.context)
      }

      // Refresh the current page
      $nuxt.refresh()
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

    // WebSocket Base URL
    const wsURL = `${base}/ws`

    logger.log(`WS connect to ${wsURL}`)

    ws = new WebSocket(wsURL)
    ws.onopen = onOpen
    ws.onmessage = onMessage
    ws.onerror = onError
    ws.onclose = onClose
  }

  return {
    connect
  }
}
