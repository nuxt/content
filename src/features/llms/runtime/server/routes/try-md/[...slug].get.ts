import { withLeadingSlash } from 'ufo'
import { getRouterParams, eventHandler, setHeader } from 'h3'
// @ts-expect-error is not typed
import { isPublicAssetURL } from '#nitro-internal-virtual/public-assets'

export default eventHandler(async (event) => {
  const rawSlug = withLeadingSlash(getRouterParams(event)['slug']!)
  if (isPublicAssetURL(rawSlug)) {
    setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
    return $fetch(rawSlug)
  }

  const slug = rawSlug?.substring(3, rawSlug.length - 3)
  return $fetch(slug)
})
