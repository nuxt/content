import { camelCase } from 'scule'
import jiti from 'jiti'
import hasha from 'hasha'
import { logger } from '../../utils'
import { DocusContext } from '../../types/Context'
import { DocusMarkdownNode } from '../../types'

export function flattenNodeText(node: DocusMarkdownNode): string {
  if (node.type === 'text') {
    return node.value || ''
  } else {
    return (node.children || []).reduce((text, child) => {
      return text.concat(flattenNodeText(child))
    }, '')
  }
}

export function flattenNode(node: DocusMarkdownNode, maxDepth = 2, _depth = 0): Array<DocusMarkdownNode> {
  if (!Array.isArray(node.children) || _depth === maxDepth) {
    return [node]
  }
  return [
    node,
    ...node.children.reduce(
      (acc, child) => acc.concat(flattenNode(child, maxDepth, _depth + 1)),
      [] as Array<DocusMarkdownNode>
    )
  ]
}

export function setNodeData(node: DocusMarkdownNode & { data: any }, name: string, value: any, pageData: any) {
  if (!name.startsWith(':')) {
    name = ':' + name
  }
  const dataKey = `docus_d_${hasha(JSON.stringify(value)).substr(0, 8)}`
  pageData[dataKey] = value
  node.data.hProperties[name] = dataKey
}

const _require = jiti(__filename)

export function tryRequire(name: string) {
  try {
    const _plugin = _require(require.resolve(name))

    return _plugin.default || _plugin
  } catch (e) {
    logger.error(e.toString())
    return null
  }
}

const processPlugins = (type: string, markdown: any) => {
  const plugins = []

  for (const plugin of markdown[`${type}Plugins`]) {
    let name
    let options
    let instance

    if (typeof plugin === 'string') {
      name = plugin
      options = markdown[camelCase(name)]
    } else if (Array.isArray(plugin)) {
      ;[name, options] = plugin
    } else if (typeof plugin === 'object') {
      instance = plugin.instance
      name = plugin.name
      options = plugin.options || markdown[plugin.name]
    }

    try {
      instance = instance || tryRequire(name)

      plugins.push({ instance, name, options })
    } catch (e) {
      logger.error(e.toString())
    }
  }

  return plugins
}

export const processContext = (context: DocusContext) => {
  const {
    transformers: { markdown }
  } = context
  markdown.remarkPlugins = processPlugins('remark', markdown)
  markdown.rehypePlugins = processPlugins('rehype', markdown)
}
