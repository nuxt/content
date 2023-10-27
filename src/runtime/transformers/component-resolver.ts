import { pascalCase } from 'scule'
import type { ParsedContent } from '../types'
import htmlTags from '../utils/html-tags'
import { defineTransformer } from './utils'

async function resolveContentComponents (body: ParsedContent['body'], meta: Record<string, string>) {
  const components = Array.from(new Set(loadComponents(body, meta)))
  // @ts-ignore
  const manifest = await import('#build/content-components').catch(() => ({}))
  const resolvedComponentsEntries = await Promise.all(components.map(async ([t, c]) => {
    const componentImporter = manifest[pascalCase(c)]
    if (typeof componentImporter === 'function') {
      return [t, await componentImporter()]
    }
    return [t, c]
  }))

  return Object.fromEntries(resolvedComponentsEntries)
  function loadComponents (node: any, tags: Record<string, string>) {
    if (node.type === 'text' || node.tag === 'binding') {
      return []
    }
    const renderTag: string = (typeof node.props?.__ignoreMap === 'undefined' && tags[node.tag!]) || node.tag!
    const components: Array<Array<string>> = []
    if (node.type !== 'root' && !htmlTags.includes(renderTag as any)) {
      components.push([node.tag, renderTag])
    }
    for (const child of (node.children || [])) {
      components.push(...loadComponents(child, tags))
    }
    return components
  }
}
export default defineTransformer({
  name: 'component-resolver',
  extensions: ['.*'],
  async transform (content, options = {}) {
    if (process.server) {
      // This transformer is only needed on client side to resolve components
      return content
    }

    const _components = await resolveContentComponents(content.body, {
      ...(options?.tags || {}),
      ...(content._components || {})
    })

    content._components = _components
    return content
  }
})
