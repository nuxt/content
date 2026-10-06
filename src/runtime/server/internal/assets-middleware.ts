import { defineEventHandler } from 'nuxt/server'
import { content } from '#imports'
import type { AnyComarkContent, ContentHub } from 'comark-content'
import type { MediaMethods } from 'comark-content/plugins/media'

type ContentWithMedia = (AnyComarkContent | ContentHub) & Partial<MediaMethods>

export default defineEventHandler(async (event) => {
  const _content = content as unknown as ContentWithMedia
  if (!_content.media) return

  const method = event.req.method
  if (method !== 'GET' && method !== 'HEAD') return

  const info = _content.stat(event.url.pathname.replace('/media', ''))
  if (info?.meta.kind !== 'media') return

  const body = await _content.media.get(info.meta.key)
  if (body == null) return

  return new Response(method === 'HEAD' ? null : body as BodyInit, {
    headers: info.meta.type ? { 'content-type': info.meta.type } : undefined,
  })
})
