import type { baseParser } from '../base';

export interface MarkdownOptions {
  remarkPlugins: () => string[] | string[]
  remarkExternalLinks: () => string[] | string[]
  rehypePlugins: () => string[] | string[]
  basePlugins: () => string[] | string[]
  plugins: () => string[] | string[]
  prism: {
    theme: string | boolean
  }
}

export class IMarkdown extends baseParser<MarkdownOptions> {
  processPluginsFor(type: any, stream: any): any;
  flattenNodeText(node: any): any;
  /**
   * Generate table of contents
   * @param body - JSON AST generated from markdown.
   * @returns List of headers
   */
  generateToc(body: object): any[];
  /**
   * Generate json body
   * @param content - JSON AST generated from markdown.
   * @returns JSON AST body
   */
  generateBody(content: string): object;
  /**
   * Converts markdown document to its JSON structure.
   * @param file - Markdown file
   * @return JSON
   */
  toJSON(file: string): any;
}
