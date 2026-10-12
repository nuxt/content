import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, 'docs').select('title').all()
  // order independent fingerprint of the served documents, to tell releases (and partial imports) apart
  const titles = docs.map(doc => doc.title).sort()
  return { count: docs.length, fingerprint: titles.join('|').length + ':' + titles.at(0) + ':' + titles.at(-1) + ':' + titles.filter(title => title.endsWith(' v2')).length }
})
