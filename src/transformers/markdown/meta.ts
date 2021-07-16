import defu from 'defu'
import { pascalCase } from 'scule'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'
import { expandTags, flatUnwrap, nodeTextContent } from '../../runtime/utils'
import { DocusRootNode } from '../../types'

export function generatePosition(path: string): string {
  const position = path
    .split('/')
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^(\d+)\./)
      if (match) {
        return padLeft(match[1], 4)
      }
      return '9999' // Parts without a position are going down to the bottom
    })
    .join('')
  return padRight(position, 12)
}

/**
 * Clean up special keywords from path part
 */
export function generateSlug(name: string): string {
  return (
    name
      /**
       * Remove hidden keyword
       */
      .replace(/^_/, '')
      /**
       * Remove numbering
       */
      .replace(/(\d+\.)?(.*)/, '$2')
      /**
       * remove index keyword
       */
      .replace(/^index/, '')
      /**
       * remove draft keyword
       */
      .replace(/\.draft/, '')
  )
}

export function generateTitleFromSlug(slug: string) {
  return slug.split(/[\s-]/g).map(pascalCase).join(' ')
}

export function generateTo(path: string): string {
  return withLeadingSlash(withoutTrailingSlash(path.split('/').map(generateSlug).join('/')))
}

export function isDraft(path: string): boolean {
  return !!path.match(/\.draft(\/|\.|$)/)
}

/**
 * Files or directories that starts with underscore `_` will mark as hidden
 * @param path content path
 * @returns true if the is part in the path that starts with `_`
 */
export function isHidden(path: string): boolean {
  return path.split('/').some(part => part.match(/^_.*/))
}

function padLeft(value: string, length: number): string {
  return ('0'.repeat(length) + value).substr(String(value).length)
}

function padRight(value: string, length: number): string {
  return (value + '0'.repeat(length)).substr(0, length)
}

export function processHeading(body: DocusRootNode) {
  let title = ''
  let description = ''
  const children = body.children
    // top level `text` can be ignored
    .filter(node => node.type !== 'text')

  if (children.length && expandTags(['h1']).includes(children[0].tag || '')) {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Remove anchor link from H1 tag
     */
    node.children = flatUnwrap(node.children, ['a'])

    /**
     * Generate title
     */
    title = nodeTextContent(node)

    /**
     * Inject class
     */
    node.props = defu(node.props || {}, {
      class: 'd-heading-title'
    })
  }

  if (children.length && expandTags(['p']).includes(children[0].tag || '')) {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Generate description
     */
    description = nodeTextContent(node)

    /**
     * Inject class
     */
    node.props = defu(node.props || {}, {
      class: 'd-heading-description'
    })
  }

  if (children.length && expandTags(['hr']).includes(children[0].tag || '')) {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Inject class
     */
    node.props = defu(node.props || {}, {
      class: 'd-heading-hr'
    })
  }

  return {
    title,
    description,
    body
  }
}
