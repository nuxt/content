import { withBase } from 'ufo'
import { queryCollection } from '../../../../runtime/server'
import type { ModuleOptions } from 'nuxt-llms'
import type { Collections, PageCollectionItemBase } from '@nuxt/content'
import type { ContentEvent } from '../../../../runtime/internal/event'
import type { ContentLLMSCollectionSection } from './utils'
import { createDocumentGenerator, prepareContentSections } from './utils'

export interface ContentLLMSHooks {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook: (name: string, fn: (...args: any[]) => unknown) => unknown
  callHook: (name: string, ...args: unknown[]) => unknown
}

/**
 * Add the content collections to the `llms.txt` sections, and return the raw markdown paths to prerender.
 */
export function registerContentLLMSHooks(hooks: ContentLLMSHooks) {
  const prerenderPaths = new Set<string>()
  hooks.hook('llms:generate', async (event: ContentEvent, options: ModuleOptions) => {
    prepareContentSections(options.sections)

    const sectionsToRemove = [] as string[]
    for (const index in options.sections) {
      const section = options.sections[index] as ContentLLMSCollectionSection
      if (!section.contentCollection) {
        continue
      }

      const query = queryCollection(event, section.contentCollection as keyof Collections)
        .select('path', 'title', 'seo', 'description')
        .where('path', 'NOT LIKE', '%/.navigation')

      const filters = section.contentFilters || []
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value)
      }

      const docs = await query.all() as unknown as PageCollectionItemBase[]

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

  hooks.hook('llms:generate:full', async (event: ContentEvent, options: ModuleOptions, contents: string[]) => {
    prepareContentSections(options.sections)

    const generateDocument = await createDocumentGenerator()
    for (const index in options.sections) {
      const section = options.sections[index] as ContentLLMSCollectionSection
      if (!section.contentCollection) {
        // Ignore non content sections
        continue
      }

      const query = queryCollection(event, section.contentCollection as keyof Collections)
        .where('path', 'NOT LIKE', '%/.navigation')

      const filters = section.contentFilters || []
      for (const filter of filters) {
        query.where(filter.field, filter.operator, filter.value)
      }

      const docs = await query.all() as PageCollectionItemBase[]

      for (const doc of docs) {
        await hooks.callHook('content:llms:generate:document', event, doc, options)
        const markdown = await generateDocument(doc, options)
        contents.push(markdown!)
      }
    }
  })

  function getDocumentLink(link: string, collection: string, options: ModuleOptions) {
    const contentRawMarkdown = (options as unknown as { contentRawMarkdown: false | { rewriteLLMSTxt: boolean, excludeCollections: string[] } })?.contentRawMarkdown
    if (contentRawMarkdown === false || contentRawMarkdown?.rewriteLLMSTxt === false || contentRawMarkdown?.excludeCollections?.includes(collection)) {
      return withBase(link, options.domain)
    }

    link = `/raw${link}.md`

    if (link.endsWith('/.md')) {
      link = link.slice(0, -3) + 'index.md'
    }

    prerenderPaths.add(link)

    return withBase(link, options.domain)
  }

  return prerenderPaths
}
