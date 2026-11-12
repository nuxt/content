import { appendHeader } from 'h3'
import { withBase } from 'ufo'
import type { NitroApp } from 'nitropack/types'
import type { ContentLLMSCollectionSection } from './utils'
import { createDocumentGenerator, getDefaultLocale, localizePath, prepareContentSections } from './utils'
import type { PageCollectionItemBase } from '@nuxt/content'
import { defineNitroPlugin } from 'nitropack/runtime'
// @ts-expect-error - typecheck does not detect queryCollection in imports
import { queryCollection } from '#imports'
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

      const locale = getDefaultLocale(section.contentCollection)
      const query = queryCollection(event, section.contentCollection)
        .select('path', 'title', 'seo', 'description', ...(locale ? ['locale'] : []))
        .where('path', 'NOT LIKE', '%/.navigation')

      const filters = section.contentFilters || []
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value)
      }

      if (locale && !filters.some(filter => filter.field === 'locale')) {
        query.locale(locale)
      }

      const docs = await query.all() as Array<PageCollectionItemBase & { locale?: string }>

      if (docs.length === 0 && section.__nuxt_content_auto_generate) {
        sectionsToRemove.push(index)
        continue
      }

      section.links ||= []
      section.links.push(...docs.map((doc) => {
        return {
          title: doc.title || doc?.seo?.title || '',
          description: doc.description || doc?.seo?.description || '',
          href: getDocumentLink(doc.path, section.contentCollection!, options, doc.locale),
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

      const locale = getDefaultLocale(section.contentCollection)
      if (locale && !filters.some(filter => filter.field === 'locale')) {
        query.locale(locale)
      }

      const docs = await query.all()

      for (const doc of docs) {
        // @ts-expect-error -- TODO: fix types
        await nitroApp.hooks.callHook('content:llms:generate:document', event, doc, options)
        const markdown = await generateDocument(doc, options)
        contents.push(markdown!)
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

  function getDocumentLink(link: string, collection: string, options: ModuleOptions, locale?: string) {
    const contentRawMarkdown = (options as unknown as { contentRawMarkdown: false | { rewriteLLMSTxt: boolean, excludeCollections: string[] } })?.contentRawMarkdown
    if (contentRawMarkdown === false || contentRawMarkdown?.rewriteLLMSTxt === false || contentRawMarkdown?.excludeCollections?.includes(collection)) {
      return withBase(localizePath(link, collection, locale), options.domain)
    }

    link = `/raw${localizePath(link, collection, locale, true)}.md`

    if (link.endsWith('/.md')) {
      link = link.slice(0, -3) + 'index.md'
    }

    prerenderPaths.add(link)

    return withBase(link, options.domain)
  }
})
