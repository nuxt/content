import { joinURL, hasProtocol } from 'ufo'
import { eventHandler, setHeader } from 'h3'
import type { MinimalTree, RuntimeConfig } from '@nuxt/content'
import { decompressTree } from '@nuxt/content/runtime'
import type { MDCElement } from '@nuxtjs/mdc'
import type { ContentLLMSCollectionSection, ContentLLMSLinksSection, LLMSOptions } from '../../types'
import { useRuntimeConfig } from '#imports'

const linkProps = ['href', 'src', 'to']

async function importExternalPackage(name: string) {
  return await import(name)
}

export default eventHandler(async (event) => {
  const stringifyMarkdown = await importExternalPackage('@nuxtjs/mdc/runtime').then(res => res.stringifyMarkdown)
  const visit = await importExternalPackage('unist-util-visit').then(res => res.visit)

  const options = (useRuntimeConfig(event).content as RuntimeConfig['content']).llms as LLMSOptions

  const llms = []

  for (const section of options.sections) {
    if ((section as ContentLLMSLinksSection).links) {
      // Ignore links section in llms_full.txt
      continue
    }

    // @ts-expect-error - typecheck does not derect server querryCollection
    const query = queryCollection(event, section.collection)
      .where('path', 'NOT LIKE', '%/.navigation')

    const filters = (section as ContentLLMSCollectionSection).filters || []
    for (const filter of filters) {
      query.where(filter.field, filter.operator, filter.value)
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

    visit(hastTree, (node: MDCElement) => node.props?.to || node.props?.href || node.props?.src, (node: MDCElement) => {
      for (const prop of linkProps) {
        if (node.props[prop] && !hasProtocol(node.props[prop])) {
          node.props[prop] = joinURL(options.domain, node.props[prop])
        }
      }
    })
    return hastTree
  }
})
