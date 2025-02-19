import type { PageCollectionItemBase, SQLOperator } from '@nuxt/content'
import { withBase } from 'ufo'
import type { LLMsSection } from 'nuxt-llms'
import { onLLMsGenerate, onLLMsGenerateFull } from 'nuxt-llms/runtime'
import { createDocumentGenerator } from './utils'

interface ContentLLMSCollectionSection extends LLMsSection {
  contentCollection?: string
  contentFilters?: Array<{
    field: string
    operator: SQLOperator
    value?: string
  }>
}

// @ts-expect-error - typecheck does not derect
export default defineNitroPlugin(() => {
  onLLMsGenerate(async (event, options) => {
    const sections = options.sections as ContentLLMSCollectionSection[]
    for (const section of sections) {
      if (section.contentCollection) {
      // @ts-expect-error - typecheck does not derect server querryCollection
        const query = queryCollection(event, section.contentCollection)
          .select('path', 'title', 'description')
          .where('path', 'NOT LIKE', '%/.navigation')

        const filters = section.contentFilters || []
        for (const filter of filters) {
          query.where(filter.field, filter.operator, filter.value)
        }

        const docs = await query.all() as PageCollectionItemBase[]

        section.links ||= []
        section.links.push(...docs.map((doc) => {
          return {
            title: doc.title,
            description: doc.description,
            href: withBase(doc.path, options.domain),
          }
        }))
      }
    }
  })

  onLLMsGenerateFull(async (event, options, contents) => {
    const sections = options.sections as ContentLLMSCollectionSection[]
    const generateDocument = await createDocumentGenerator()
    for (const section of sections) {
      if (!section.contentCollection) {
        // Ignore non content sections
        continue
      }

      // @ts-expect-error - typecheck does not derect server querryCollection
      const query = queryCollection(event, section.contentCollection)
        .where('path', 'NOT LIKE', '%/.navigation')

      const filters = section.contentFilters || []
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value)
      }

      const docs = await query.all()

      for (const doc of docs) {
        const markdown = await generateDocument(doc, options)
        contents.push(markdown)
      }
    }
  })
})
