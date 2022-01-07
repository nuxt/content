interface ParsedContent {
  meta: {
    id: string
    [key: string]: any
  }
  body: any
}

interface ContentPluginOptions {
  name: string
  extentions: string[]
  parse(id: string, content: string): Promise<ParsedContent> | ParsedContent
  transform: ((content: ParsedContent) => Promise<ParsedContent>) | ((content: ParsedContent) => ParsedContent)
}
