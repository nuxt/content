const collections = ['docs_en', 'docs_foo', 'docs_root', 'landing_en', 'multi'] as const

function pick(item: { stem: string, extension: string } | null | undefined) {
  return item && { stem: item.stem, extension: item.extension }
}

export default defineEventHandler(async (event) => {
  const files = Object.fromEntries(await Promise.all(collections.map(async (name) => {
    const items = await queryCollection(event, name).order('stem', 'ASC').all()
    return [name, items.map(pick)]
  })))

  const byStem = pick(await queryCollection(event, 'docs_en').where('stem', '=', 'en/1.guide/2.page').first())
  const byExtension = (await queryCollection(event, 'docs_en').where('extension', '=', 'md').all()).map(pick)

  const navigation = Object.fromEntries(await Promise.all(['docs_en', 'docs_root'].map(async name =>
    [name, await queryCollectionNavigation(event, name as 'docs_en')],
  )))

  return { files, byStem, byExtension, navigation }
})
