import visit from 'unist-util-visit'
import { TAGS_MAP } from '../../../runtime/utils'
import { parseFrontMatter } from '../fontmatter'

const toFrontMatter = (yamlString: string) => `---\n${yamlString}\n---`

/**
 * Convert a HTML tag to its equivalent prose component
 */
const tagName = (name: string) => (TAGS_MAP[name] ? TAGS_MAP[name][1 /* prose tag */] : name)

export default function remarkComponentsPlugin(components: any[]) {
  function getNodeData(node) {
    if (!node.rawData) {
      return {}
    }

    const yaml = node.rawData
    const { data } = parseFrontMatter(toFrontMatter(yaml))

    return data
  }

  function bindData(data, pageData) {
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

  return async (tree, { data: pageData }) => {
    const jobs = []
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], visitor)

    function visitor(node) {
      const directive = components[node.name]
      const data = node.data || (node.data = {})

      // parse data slots and retrive data
      const nodeData = getNodeData(node)

      data.hName = tagName(node.name)
      data.hProperties = bindData(
        {
          ...node.attributes,
          ...nodeData
        },
        pageData
      )
      if (directive) {
        jobs.push(directive(node, pageData))
      }
    }

    await Promise.all(jobs)
    return tree
  }
}
