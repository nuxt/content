import { existsSync } from 'node:fs'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { ModuleOptions, ClientFunctions, ServerFunctions } from '../types'
import { DEVTOOLS_MODULE_ICON, DEVTOOLS_MODULE_NAME, DEVTOOLS_MODULE_TITLE, DEVTOOLS_RPC_NAMESPACE, DEVTOOLS_UI_PATH, DEVTOOLS_UI_PORT } from '../constants'
import { useViteWebSocket } from '../utils/devtools'
import { setupRPC } from './rpc'

export function setupDevtools(options: ModuleOptions, nuxt: Nuxt, resolve: Resolver['resolve']) {
  const clientPath = resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sirv = await import('sirv').then(r => r.default || r) as any
      server.middlewares.use(
        DEVTOOLS_UI_PATH,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      config.server.proxy[DEVTOOLS_UI_PATH] = {
        target: `http://localhost:${DEVTOOLS_UI_PORT}${DEVTOOLS_UI_PATH}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(DEVTOOLS_UI_PATH, ''),
      }
    })
  }

  addCustomTab({
    name: DEVTOOLS_MODULE_NAME,
    title: DEVTOOLS_MODULE_TITLE,
    icon: DEVTOOLS_MODULE_ICON,
    view: {
      type: 'iframe',
      src: DEVTOOLS_UI_PATH,
    },
  })

  console.log('Nuxt Devtools Content')

  const wsServer = useViteWebSocket(nuxt)
  onDevToolsInitialized(async () => {
    const rpcFunctions = setupRPC({ options, wsServer, nuxt })
    extendServerRpc<ClientFunctions, ServerFunctions>(DEVTOOLS_RPC_NAMESPACE, rpcFunctions)
  })
}
