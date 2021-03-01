const matter = require('gray-matter')
const unified = require('unified')
const parse = require('remark-parse')
const remark2rehype = require('remark-rehype')

const handlers = require('./handlers')
const jsonCompiler = require('./compilers/json')

class Markdown {
  constructor (options = {}) {
    this.options = options
  }

  processPluginsFor (type, stream) {
    for (const { instance, options } of this.options[`${type}Plugins`]) {
      stream = stream.use(instance, options)
    }

    return stream
  }

  flattenNodeText (node) {
    if (node.type === 'text') {
      return node.value
    } else {
      return node.children.reduce((text, child) => {
        return text.concat(this.flattenNodeText(child))
      }, '')
    }
  }

  flattenNode (node, maxDepth = 2, depth = 0) {
    if (!Array.isArray(node.children) || depth === maxDepth) {
      return [node]
    }
    return [
      node,
      ...node.children.reduce((acc, child) => acc.concat(this.flattenNode(child, maxDepth, depth + 1)), [])
    ]
  }

  /**
   * Generate table of contents
   * @param {object} body - JSON AST generated from markdown.
   * @returns {array} List of headers
   */
  generateToc (body) {
    const { tocTags } = this.options

    const children = this.flattenNode(body, 2)

    return children.filter(node => tocTags.includes(node.tag)).map((node) => {
      const id = node.props.id

      const depth = ({
        h2: 2,
        h3: 3,
        h4: 4,
        h5: 5,
        h6: 6
      })[node.tag]

      const text = this.flattenNodeText(node)

      return {
        id,
        depth,
        text
      }
    })
  }

  /**
   * Generate json body
   * @param {string} content - JSON AST generated from markdown.
   * @param {object} data - document data
   * @returns {object} JSON AST body
   */
  async generateBody (content, data = {}) {
    let { highlighter } = this.options
    if (typeof highlighter === 'function' && highlighter.length === 0) {
      highlighter = await highlighter()
    }

    return new Promise((resolve, reject) => {
      let stream = unified().use(parse)

      stream = this.processPluginsFor('remark', stream)
      stream = stream.use(remark2rehype, {
        handlers: handlers(highlighter),
        allowDangerousHtml: true
      })
      stream = this.processPluginsFor('rehype', stream)

      stream
        .use(jsonCompiler)
        .process({ data, contents: content }, (error, file) => {
          /* istanbul ignore if */
          if (error) {
            return reject(error)
          }
          resolve(file.result)
        })
    })
  }

  /**
   * Generate text excerpt summary
   * @param {string} excerptContent - JSON AST generated from excerpt markdown.
   * @returns {string} concatinated excerpt
   */
  generateDescription (excerptContent) {
    return this.flattenNodeText(excerptContent)
  }

  /**
   * Converts markdown document to it's JSON structure.
   * @param {string} file - Markdown file
   * @return {Object}
   */
  async toJSON (file) {
    const { data, content, ...rest } = matter(file, { excerpt: true, excerpt_separator: '<!--more-->' })

    const documentData = data || {}
    // Compile markdown from file content to JSON
    const body = await this.generateBody(content, documentData)
    // Generate toc from body
    const toc = this.generateToc(body)

    let excerpt
    let description
    if (rest.excerpt) {
      excerpt = await this.generateBody(rest.excerpt)
      description = this.generateDescription(excerpt)
    }

    return {
      description,
      ...documentData,
      toc,
      body,
      text: content,
      excerpt
    }
  }
}

module.exports = Markdown
