import { queryCollection } from '@nuxt/content/v3/server'

// What v3 pages expose for `useSeoMeta(page.seo)` and listings.
export default defineEventHandler(async (event) => {
  const pages = await queryCollection(event, 'content').all()
  return Object.fromEntries(pages.map(page => [page.path, { title: page.title, description: page.description, seo: page.seo }]))
})
