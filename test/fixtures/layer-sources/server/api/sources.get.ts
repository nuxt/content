// Served by the deployed function, which evaluates the layer's `server/content.ts` again without `content/`.
// `resolveContent()` returns a content that isn't live as is.
export default defineEventHandler(async () => {
  return (await (await resolveContent(content)).list()).map((file: { path: string }) => file.path).sort()
})
