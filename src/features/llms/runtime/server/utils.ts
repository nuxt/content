import { decompressTree } from '@nuxt/content/runtime'
import type { MinimalTree } from '@nuxt/content'
import type { MDCElement } from '@nuxtjs/mdc'
import { withBase } from 'ufo'
import type { PageCollectionItemBase } from '~/src/types'

const linkProps = ['href', 'src', 'to']

const importExternalPackage = async (name: string) => await import(name)

export async function createDocumentGenerator() {
  const visit = await importExternalPackage('unist-util-visit').then(res => res.visit)
  const stringifyMarkdown = await importExternalPackage('@nuxtjs/mdc/runtime').then(res => res.stringifyMarkdown)

  return generateDocument

  async function generateDocument(doc: PageCollectionItemBase, options: { domain: string }) {
    const hastTree = refineDocumentBody(doc.body as unknown as MinimalTree, options)
    let markdown = await stringifyMarkdown(hastTree, {})

    if (!markdown?.trim().startsWith('# ')) {
      markdown = `# ${doc.title}\n\n${markdown}`
    }
    return markdown
  }

  function refineDocumentBody(body: MinimalTree, options: { domain: string }) {
    const hastTree = decompressTree(body)

    visit(hastTree, (node: MDCElement) => !!node.props?.to || !!node.props?.href || !!node.props?.src, (node: MDCElement) => {
      for (const prop of linkProps) {
        if (node.props?.[prop]) {
          node.props[prop] = withBase(node.props[prop], options.domain)
        }
      }
    })
    return hastTree
  }
}
