import type { WebSocketServer } from 'vite'
import type { Nuxt } from 'nuxt/schema'

export function useViteWebSocket(nuxt: Nuxt) {
  return new Promise<WebSocketServer>((_resolve) => {
    nuxt.hooks.hook('vite:serverCreated', (viteServer) => {
      _resolve(viteServer.ws)
    })
  })
}
