import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type Nodes as MdastContent } from 'mdast'

type Node = MdastContent & {
  name: string
  attributes?: Properties
  fmAttributes?: Properties
}

export default function containerComponent (state: State, node: Node) {
  const result: Element = {
    type: 'element',
    tagName: node.name,
    properties: {
      ...node.attributes,
      ...node.data?.hProperties
    },
    children: state.all(node)
  }
  state.patch(node, result)

  // @ts-ignore Inline attributes that passed in MDC sysntax `:component{...attributes}`
  result.attributes = node.attributes

  // @ts-ignore Attributes define using FrontMatter syntax and YAML format
  result.fmAttributes = node.fmAttributes

  return result
}
