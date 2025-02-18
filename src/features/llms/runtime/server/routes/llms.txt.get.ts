import { eventHandler, setHeader } from 'h3'
import { joinURL } from 'ufo'
import type { PageCollectionItemBase, RuntimeConfig } from '@nuxt/content'
import type { ContentLLMSCollectionSection, ContentLLMSLinksSection, LLMSOptions } from '../../types'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  const options = (useRuntimeConfig(event).content as RuntimeConfig['content']).llms as LLMSOptions

  const llms = [
    `# ${options.title || 'Documentation'}`,
  ]

  if (options.description) {
    llms.push(`> ${options.description}`)
  }

  for (const section of options.sections) {
    if ((section as ContentLLMSLinksSection).links) {
      const links = (section as ContentLLMSLinksSection).links.map((link) => {
        return `- [${link.title}](${link.href}): ${link.description}`
      })
      llms.push(`## ${section.title}`)
      if (section.description) {
        llms.push(section.description)
      }
      llms.push(links.join('\n'))
      continue
    }

    // @ts-expect-error - typecheck does not derect server querryCollection
    const query = queryCollection(event, section.collection)
      .select('path', 'title', 'description')
      .where('path', 'NOT LIKE', '%/.navigation')

    const filters = (section as ContentLLMSCollectionSection).filters || []
    for (const filter of filters) {
      query.where(filter.field, filter.operator, filter.value)
    }

    const docs = await query.all() as PageCollectionItemBase[]

    const links = docs.map((doc) => {
      return `- [${doc.title}](${joinURL(options.domain, doc.path)}): ${doc.description}`
    })

    if (section.title)
      llms.push(`## ${section.title}`)

    if (section.description) {
      llms.push(section.description)
    }

    llms.push(links.join('\n'))
  }

  if (options.notes && options.notes.length) {
    llms.push(
      '## Notes',
      (options.notes || []).map(note => `- ${note}`).join('\n'),
    )
  }

  setHeader(event, 'Content-Type', 'text/plain')
  return llms.join('\n\n')
})
