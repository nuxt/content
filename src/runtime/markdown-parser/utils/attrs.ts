export const unsafeLinkPrefix = [
  'javascript:',
  'data:text/html',
  'vbscript:',
  'data:text/javascript',
  'data:text/vbscript',
  'data:text/css',
  'data:text/plain',
  'data:text/xml'
]

export const isSafeAttribute = (attribute: string, value: string) => {
  if (attribute.startsWith('on')) {
    // eslint-disable-next-line no-console
    console.warn(`[@nuxt/content] removing unsafe attribute: ${attribute}="${value}"`)
    return false
  }

  if (attribute === 'href' || attribute === 'src') {
    return !unsafeLinkPrefix.some(prefix => value.toLowerCase().startsWith(prefix))
  }

  return true
}
