interface MarkdownPlugin {
  name: string
  instance?: any
  options?: any
}

export interface DocusContext {
  locales: {
    codes: string[]
    defaultLocale: string
  }
  dir: {
    components: string[]
  }
  search: {
    inheritanceFields: string[]
    fields: string[]
  }
  transformers: {
    markdown: {
      toc: {
        depth: number
        searchDepth: number
      }
      components: {
        [key: string]: any
      }
      remarkPlugins: Array<string | Array<any> | MarkdownPlugin>
      rehypePlugins: Array<string | Array<any> | MarkdownPlugin>
    }
  }
}
