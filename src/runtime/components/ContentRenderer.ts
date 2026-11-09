import ContentDocument from './ContentDocument'

let warned = false

const setup: NonNullable<typeof ContentDocument.setup> = (props, ctx) => {
  if (import.meta.dev && !warned) {
    warned = true
    console.warn('[@nuxt/content] `<ContentRenderer>` is deprecated, use `<ContentDocument>` instead. It takes the same props and slots.')
  }
  return ContentDocument.setup!(props, ctx)
}

/**
 * @deprecated Part of the Content v3 compatibility layer (`content.v3Composables`), use `<ContentDocument>` instead.
 */
export default { ...ContentDocument, name: 'ContentRenderer', setup } as typeof ContentDocument
