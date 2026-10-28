// A v3-era sitemap source: frontmatter outside the schema is read from `meta`.
export default defineEventHandler(async (event) => {
  const pages = await queryCollection(event, 'content').all()
  return pages
    .filter(page => page.meta?.sitemap !== false)
    .map(page => ({ loc: page.path, lastmod: page.meta?.modifiedAt }))
})
