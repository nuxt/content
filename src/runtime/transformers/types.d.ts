interface TransformedContent {
  [key: string]: any;
}

export interface ContentTransformer {
  name: string
  extensions: string[]
  parse?(id: string, content: string, options: any): TransformedContent
  transform?(content: TransformedContent, options: any): TransformedContent
}

export interface TransformContentOptions {
  transformers?: ContentTransformer[]

  [key: string]: any
}
