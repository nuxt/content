import { eventHandler, serveStatic } from 'h3'
import { cms } from '#imports'
import type { AnyComarkContent, ContentHub } from 'comark-content'
import type { MediaMethods } from 'comark-content/plugins/media'

type ContentWithMedia = (AnyComarkContent | ContentHub) & Partial<MediaMethods>

export default eventHandler((event) => {
  const _cms = cms as unknown as ContentWithMedia
  if (!_cms.media) return

  const info = _cms.stat(event.path.replace('/media', ''))
  if (info?.meta.kind === 'media') {
    return serveStatic(event, {
      getContents: async () => _cms.media!.get(info.meta.key),
      getMeta: () => ({
        type: info.meta.type,
      }),
    })
  }
})
