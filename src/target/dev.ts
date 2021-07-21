import { Nuxt } from '@nuxt/kit'
import { WatchEvent } from 'unstorage'
import { updateNavigation } from '../navigation'
import { resetDatabase } from '../server/content'
import { useWebSocket } from '../server/socket'
import { useStorage } from '../storage'
import { logger } from '../utils'

export default function setupDevTarget(options: any, nuxt: Nuxt) {
  // setup wecocket if watch is enabled
  if (options.watch) {
    const handleEvent = async (event: WatchEvent, key: string) => {
      await updateNavigation(nuxt)
      resetDatabase()

      /**
       * Broadcast a message to the server to refresh the page
       **/
      useWebSocket(options, nuxt).broadcast({ event, key })
    }
    const storage = useStorage()
    storage?.watch((event: WatchEvent, key: string) => {
      if (['content'].some(mount => key.startsWith(mount))) {
        handleEvent(event, key)
      }

      if (key.endsWith('.md')) {
        logger.info(`${key} ${event}`)
      }
    })
  }

  // Create navigation before generations
  nuxt.hook('generate:before', async () => {
    await updateNavigation(nuxt)
  })
}
