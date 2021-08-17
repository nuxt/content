import { camelCase, kebabCase } from 'scule'
import visit from 'unist-util-visit'
import { TAGS_MAP } from '../../../runtime/utils'
import { parseFrontMatter } from '../fontmatter'
import toMarkdown from './to-markdown'
import fromMarkdown from './from-markdown'
import syntax from './micromark-extension'

const toFrontMatter = (yamlString: string) => `---\n${yamlString}\n---`

/**
 * Convert a HTML tag to its equivalent prose component
 */
const tagName = (name: string) => (TAGS_MAP[name] ? TAGS_MAP[name][1 /* prose tag */] : name)

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
      const component = components[node.name]
      const nodeData = node.data || (node.data = {})

      // parse data slots and retrive data
      const yamlAttributes = getNodeData(node)

      nodeData.hName = tagName(kebabCase(camelCase(node.name)))
      nodeData.hProperties = bindData(
        {
          ...node.attributes,
          ...yamlAttributes
        },
        data
      )
      if (component) {
        jobs.push(component(node, data))
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
