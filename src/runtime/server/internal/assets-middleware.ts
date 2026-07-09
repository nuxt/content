import { eventHandler, serveStatic } from 'h3'
import { cms } from '#imports'
import type { ComarkCMS } from '@comark/cms'
import type { MediaMethods } from '@comark/cms/plugins/media'

export default eventHandler((event) => {
  const _cms = cms as ComarkCMS & MediaMethods
  const info = _cms.stat(event.path.replace('/media', ''))
  if (info?.meta.kind === 'media') {
    return serveStatic(event, {
      getContents: async () => _cms.media.get(info.meta.key),
      getMeta: () => ({
        type: info.meta.type,
      }),
    })
  }
})
