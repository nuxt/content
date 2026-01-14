import { appendHeader } from 'h3'
import { withBase } from 'ufo'
import type { NitroApp } from 'nitropack/types'
import type { ContentLLMSCollectionSection } from './utils'
import { createDocumentGenerator, prepareContentSections } from './utils'
import type { PageCollectionItemBase } from '@nuxt/content'
// @ts-expect-error - typecheck does not detect defineNitroPlugin in imports
import { defineNitroPlugin, queryCollection } from '#imports'
import type { ModuleOptions } from 'nuxt-llms'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const prerenderPaths = new Set<string>()
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
          href: getDocumentLink(doc.path, section.contentCollection!, options),
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

  if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
    nitroApp.hooks.hook('beforeResponse', (event) => {
      if (event.path === '/') {
        appendHeader(event, 'x-nitro-prerender', Array.from(prerenderPaths))
      }
    })
  }

  function getDocumentLink(link: string, collection: string, options: ModuleOptions) {
    if (options.contentRawMD === false || options.contentRawMD?.excludeCollections?.includes(collection)) {
      return withBase(link, options.domain)
    }
  
    link = `/raw${link}.md`
  
    if (link.endsWith('/.md')) {
      link = link.slice(0, -3) + 'index.md'
    }
  
    prerenderPaths.add(link)
  
  
    return withBase(link, options.domain)
  }
})
