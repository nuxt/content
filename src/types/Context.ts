interface MarkdownPlugin {
  name: string
  path?: string
  configKey?: string
  options?: any
}

export interface DocusContext {
  locales: {
    codes: string[]
    defaultLocale: string
  }
  database: {
    provider: string
    options: any
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
      components: Array<string | Array<any> | MarkdownPlugin>
      remarkPlugins: Array<string | Array<any> | MarkdownPlugin>
      rehypePlugins: Array<string | Array<any> | MarkdownPlugin>
    }
  }
}
