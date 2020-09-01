export interface IMarkdown {
  constructor(options?: {});
  options: {};
  processPluginsFor(type: any, stream: any): any;
  flattenNodeText(node: any): any;
  /**
   * Generate table of contents
   * @param {object} body - JSON AST generated from markdown.
   * @returns {array} List of headers
   */
  generateToc(body: object): any[];
  /**
   * Generate json body
   * @param {string} content - JSON AST generated from markdown.
   * @returns {object} JSON AST body
   */
  generateBody(content: string): object;
  /**
   * Converts markdown document to it's JSON structure.
   * @param {string} file - Markdown file
   * @return {Object}
   */
  toJSON(file: string): any;
}
