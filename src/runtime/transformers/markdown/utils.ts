import { camelCase } from 'scule'
import jiti from 'jiti'
import hasha from 'hasha'
import { logger } from '../../utils'
import { DocusMarkdownNode, DocusContext } from '../../../types'

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

const _require = jiti()

export function tryRequire(name: string) {
  try {
    const _plugin = _require(_require.resolve(name))

    return _plugin.default || _plugin
  } catch (e) {
    logger.error(e.toString())
    return null
  }
}

const processPlugins = (type: string, markdown: any) => {
  const plugins = []

  for (const plugin of markdown[type]) {
    let name
    let options
    let instance
    let path

    if (typeof plugin === 'string') {
      name = plugin
      options = markdown[camelCase(name)]
    } else if (Array.isArray(plugin)) {
      ;[name, options] = plugin
    } else if (typeof plugin === 'object') {
      instance = plugin.instance
      name = plugin.name
      path = plugin.path
      options = plugin.options || markdown[plugin.configKey || plugin.name]
    }

    try {
      instance = instance || tryRequire(path || name)

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
  markdown.components = processPlugins('components', markdown)
  markdown.remarkPlugins = processPlugins('remarkPlugins', markdown)
  markdown.rehypePlugins = processPlugins('rehypePlugins', markdown)
}
