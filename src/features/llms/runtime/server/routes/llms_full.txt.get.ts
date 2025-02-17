import { joinURL, hasProtocol } from 'ufo'
import { eventHandler, setHeader } from 'h3'
import type { MinimalTree } from '@nuxt/content'
import { decompressTree } from '@nuxt/content/runtime'
import type { MDCElement } from '@nuxtjs/mdc'
import type { LLMSOptions } from '../../types'
import { useRuntimeConfig } from '#imports'

const linkProps = ['href', 'src', 'to']

async function importExternalPackage(name: string) {
  return await import(name)
}

export default eventHandler(async (event) => {
  const stringifyMarkdown = await importExternalPackage('@nuxtjs/mdc/runtime').then(res => res.stringifyMarkdown)
  const visit = await importExternalPackage('unist-util-visit').then(res => res.visit)

  const options = useRuntimeConfig(event).llms as LLMSOptions

  const llms = []

  for (const section of options.sections) {
    // @ts-expect-error - typecheck does not derect server querryCollection
    const query = queryCollection(event, section.collection)
      .where('path', 'NOT LIKE', '%/.navigation')

    if (section.filters) {
      for (const filter of section.filters) {
        query.where(filter.field, filter.operator, filter.value)
      }
    }

    const docs = await query.all()

    for (const doc of docs) {
      const body = refineDocumentBody(doc.body, options)
      let markdown = await stringifyMarkdown(body, {})

      if (!markdown?.trim().startsWith('# ')) {
        markdown = `# ${doc.title}\n\n${markdown}`
      }
      llms.push(markdown)
    }
  }

  if (options.notes && options.notes.length) {
    llms.push(
      '## Notes',
      (options.notes || []).map(note => `- ${note}`).join('\n'),
    )
  }

  setHeader(event, 'Content-Type', 'text/plain')
  return llms.join('\n\n')

  function refineDocumentBody(body: MinimalTree, options: LLMSOptions) {
    const hastTree = decompressTree(body)

    visit(hastTree, node => (node as MDCElement).props?.to || (node as MDCElement).props?.href || (node as MDCElement).props?.src, (node) => {
      for (const prop of linkProps) {
        if ((node as MDCElement).props[prop] && !hasProtocol((node as MDCElement).props[prop])) {
          (node as MDCElement).props[prop] = joinURL(options.domain, (node as MDCElement).props[prop])
        }
      }
    })
    return hastTree
  }
})
