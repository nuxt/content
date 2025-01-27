import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import type { BirpcReturn } from 'birpc'
import { ref } from 'vue'
import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import { DEVTOOLS_RPC_NAMESPACE } from '../../../constants'
import type { ClientFunctions, ServerFunctions } from '../../../types'

export const devtools = ref<NuxtDevtoolsClient>()
export const devtoolsRpc = ref<NuxtDevtoolsClient['rpc']>()
export const rpc = ref<BirpcReturn<ServerFunctions, ClientFunctions>>()

onDevtoolsClientConnected(async (client) => {
  devtoolsRpc.value = client.devtools.rpc
  devtools.value = client.devtools

  rpc.value = client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>(DEVTOOLS_RPC_NAMESPACE, {
  })
})
