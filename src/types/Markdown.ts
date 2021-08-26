export interface DocusMarkdownNode {
  type: string
  tag?: string
  value?: string
  props?: {
    [key: string]: any
  }
  content?: any
  children?: DocusMarkdownNode[]
}

export interface DocusMarkdownHtmlNode extends DocusMarkdownNode {
  type: 'html'
  value: string
}

export interface DocusRootNode {
  type: 'root'
  children: DocusMarkdownNode[]
  props?: {
    [key: string]: any
  }
  ast?: DocusRootNode
}
