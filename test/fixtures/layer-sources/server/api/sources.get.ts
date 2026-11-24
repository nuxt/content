// Served by the deployed function, which evaluates the layer's `server/content.ts` again without `content/`.
export default defineEventHandler(async () => {
  return (await content.list()).map((file: { path: string }) => file.path).sort()
})
