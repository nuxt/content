import { withBase } from 'ufo'
import type { NitroApp } from 'nitropack/types'
import type { ContentLLMSCollectionSection } from './utils'
import { createDocumentGenerator, prepareContentSections } from './utils'
import type { PageCollectionItemBase } from '@nuxt/content'
// @ts-expect-error - typecheck does not detect defineNitroPlugin in imports
import { defineNitroPlugin, queryCollection } from '#imports'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('llms:generate', async (event, options) => {
    prepareContentSections(options.sections)

    const sectionsToRemove = [] as string[]
    for (const index in options.sections) {
      const section = options.sections[index] as ContentLLMSCollectionSection
      if (!section.contentCollection) {
        continue
      }

      const query = queryCollection(event, section.contentCollection)
        .select('path', 'title', 'seo', 'description')
        .where('path', 'NOT LIKE', '%/.navigation')

      const filters = section.contentFilters || []
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value)
      }

      const docs = await query.all() as PageCollectionItemBase[]

      if (docs.length === 0 && section.__nuxt_content_auto_generate) {
        sectionsToRemove.push(index)
        continue
      }

      section.links ||= []
      section.links.push(...docs.map((doc) => {
        return {
          title: doc.title || doc?.seo?.title || '',
          description: doc.description || doc?.seo?.description || '',
          href: withBase(doc.path, options.domain),
        }
      }))
    }

    // Delete emoty auto generated sections
    sectionsToRemove.reverse().forEach((index) => {
      options.sections.splice(Number(index), 1)
    })
  })

  nitroApp.hooks.hook('llms:generate:full', async (event, options, contents) => {
    prepareContentSections(options.sections)

    const generateDocument = await createDocumentGenerator()
    for (const index in options.sections) {
      const section = options.sections[index] as ContentLLMSCollectionSection
      if (!section.contentCollection) {
        // Ignore non content sections
        continue
      }

      const query = queryCollection(event, section.contentCollection)
        .where('path', 'NOT LIKE', '%/.navigation')

      const filters = section.contentFilters || []
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value)
      }

      const docs = await query.all()

      for (const doc of docs) {
        // @ts-expect-error -- TODO: fix types
        await nitroApp.hooks.callHook('content:llms:generate:document', event, doc, options)
        const markdown = await generateDocument(doc, options)
        contents.push(markdown)
      }
    }
  })
})
