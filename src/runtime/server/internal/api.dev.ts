import { eventHandler, toWebRequest } from 'h3'
import { cms } from '#imports'

export default eventHandler(async (event) => {
  const optionsString = globalThis?._importMeta_?.env?.NUXT_VITE_NODE_OPTIONS
  if (optionsString) {
    const options = JSON.parse(optionsString)
    if (options.baseURL) {
      return $fetch(`/__NCDEV__${event.path}`, {
        baseURL: options.baseURL,
      })
    }
  }

  return cms.handler(toWebRequest(event))
})
