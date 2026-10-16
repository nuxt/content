import { queryCollection } from '@nuxt/content/server'

/**
 * Serves the documents of the collection as a count and a fingerprint, to tell releases (and partial imports) apart
 */
export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, 'docs').select('title').all()
  // order independent
  const titles = docs.map(doc => doc.title).sort()
  return { count: docs.length, fingerprint: titles.join('|').length + ':' + titles.at(0) + ':' + titles.at(-1) + ':' + titles.filter(title => title.endsWith(' v2')).length }
})
