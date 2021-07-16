import { Nuxt } from '@nuxt/kit'
import { WatchEvent } from 'unstorage'
import { updateNavigation } from '../navigation'
import { useWebSocket } from '../server/socket'
import { useStorage } from '../storage'

export default function setupDevTarget(options: any, nuxt: Nuxt) {
  // setup wecocket if watch is enabled
  if (options.watch) {
    const storage = useStorage()
    storage?.watch((event: WatchEvent, key: string) => {
      if (['content'].some(mount => key.startsWith(mount))) {
        updateNavigation(nuxt)

        /**
         * Broadcast a message to the server to refresh the page
         **/
        useWebSocket(options, nuxt).broadcast({ event, key })
      }
    })
  }

  // Create navigation before generations
  nuxt.hook('generate:before', async () => {
    await updateNavigation(nuxt)
  })
}
