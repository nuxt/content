import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type Link } from 'mdast'
import { isRelative } from 'ufo'
import { normalizeUri } from 'micromark-util-sanitize-uri'
import { generatePath } from '../../transformers/path-meta'

export default function link (state: State, node: Link & { attributes?: Properties}) {
  const properties: Properties = {
    ...((node.attributes || {})),
    href: normalizeUri(normalizeLink(node.url))
  }

  if (node.title !== null && node.title !== undefined) {
    properties.title = node.title
  }

  const result: Element = {
    type: 'element',
    tagName: 'a',
    properties,
    children: state.all(node)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}

function normalizeLink (link: string) {
  const match = link.match(/#.+$/)
  const hash = match ? match[0] : ''
  if (link.replace(/#.+$/, '').endsWith('.md') && (isRelative(link) || (!/^https?/.test(link) && !link.startsWith('/')))) {
    return (generatePath(link.replace('.md' + hash, ''), { forceLeadingSlash: false }) + hash)
  } else {
    return link
  }
}
