import { renderMarkdown } from 'comark/render'

export default defineEventHandler(async (event) => {
  const page = await queryCollection(event, 'content').path('/').first()
  return renderMarkdown(page!)
})
