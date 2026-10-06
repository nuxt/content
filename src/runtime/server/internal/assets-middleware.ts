import { eventHandler, serveStatic } from 'h3'
import { content } from '#imports'
import type { AnyComarkContent, ContentHub } from 'comark-content'
import type { MediaMethods } from 'comark-content/plugins/media'

type ContentWithMedia = (AnyComarkContent | ContentHub) & Partial<MediaMethods>

export default eventHandler((event) => {
  const _content = content as unknown as ContentWithMedia
  if (!_content.media) return

  const info = _content.stat(event.path.replace('/media', ''))
  if (info?.meta.kind === 'media') {
    return serveStatic(event, {
      getContents: async () => _content.media!.get(info.meta.key),
      getMeta: () => ({
        type: info.meta.type,
      }),
    })
  }
})
