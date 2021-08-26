import { camelCase, kebabCase } from 'scule'
import { visit } from 'unist-util-visit'
import { parseFrontMatter } from '../fontmatter'
import { TAGS_MAP } from '../../../utils'
import toMarkdown from './to-markdown'
import fromMarkdown from './from-markdown'
import syntax from './micromark-extension'

const toFrontMatter = (yamlString: string) => `---\n${yamlString}\n---`

/**
 * Convert a HTML tag to its equivalent prose component
 */
const tagName = (name: string) => {
  name = kebabCase(camelCase(name))
  return TAGS_MAP[name] ? TAGS_MAP[name][1 /* prose tag */] : name
}

export default function remarkComponentsPlugin(components: any[]) {
  // @ts-ignore
  const data = this.data()

  add('micromarkExtensions', syntax())
  add('fromMarkdownExtensions', fromMarkdown)
  add('toMarkdownExtensions', toMarkdown)

  function add(field: string, value: any) {
    /* istanbul ignore if - other extensions. */
    if (!data[field]) {
      data[field] = []
    }

    data[field].push(value)
  }

  return async (tree: any, { data }: { data: any }) => {
    const jobs: Promise<any>[] = []
    visit(tree, ['textComponent', 'leafComponent', 'containerComponent'], visitor)

    function visitor(node: any) {
      const nodeData = node.data || (node.data = {})

      nodeData.hName = tagName(node.name)
      nodeData.hProperties = bindData(
        {
          ...node.attributes,
          // parse data slots and retrive data
          ...getNodeData(node)
        },
        data
      )

      const { instance: handler, options } = components.find(c => c.name === node.name) || {}
      if (handler) {
        jobs.push(handler(options)(node, data))
      }
    }

    await Promise.all(jobs)
    return tree
  }
}

function getNodeData(node: any) {
  if (!node.rawData) {
    return {}
  }

  const yaml = node.rawData
  const { data } = parseFrontMatter(toFrontMatter(yaml))

  return data
}

function bindData(data: any, pageData: any) {
  const enteries = Object.entries(data).map(([key, value]) => {
    if (key.startsWith(':')) {
      return [key, value]
    }
    if (typeof value === 'string') {
      return [pageData[value] ? `:${key}` : key, value]
    }
    return [`:${key}`, JSON.stringify(value)]
  })
  return Object.fromEntries(enteries)
}
