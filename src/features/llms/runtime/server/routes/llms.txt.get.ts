import { eventHandler, setHeader } from 'h3'
import { joinURL } from 'ufo'
import type { PageCollectionItemBase } from '@nuxt/content'
import type { LLMSOptions } from '../../types'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  const options = useRuntimeConfig(event).llms as LLMSOptions

  const llms = [
    `# ${options.title || 'Documentation'}`,
  ]

  if (options.description) {
    llms.push(`> ${options.description}`)
  }

  llms.push(
    '## Documentation Sets',
    `- [Complete Documentation](${joinURL(options.domain, '/llms_full.txt')}): The complete documentation including all content`,
  )

  for (const section of options.sections) {
    // @ts-expect-error - typecheck does not derect server querryCollection
    const query = queryCollection(event, section.collection)
      .select('path', 'title', 'description')
      .where('path', 'NOT LIKE', '%/.navigation')

    if (section.filters) {
      for (const filter of section.filters) {
        query.where(filter.field, filter.operator, filter.value)
      }
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
