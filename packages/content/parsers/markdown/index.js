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

  /**
   * Generate table of contents
   * @param {object} body - JSON AST generated from markdown.
   * @returns {array} List of headers
   */
  generateToc (body) {
    // Returns only h2 and h3 from body root children
    return body.children.filter(node => ['h2', 'h3'].includes(node.tag)).map((node) => {
      const id = node.props.id

      const depth = ({
        h2: 2,
        h3: 3
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
   * @returns {object} JSON AST body
   */
  async generateBody (content) {
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
        .process(content, (error, file) => {
          /* istanbul ignore if */
          if (error) {
            return reject(error)
          }
          resolve(file.result)
        })
    })
  }

  /**
   * Converts markdown document to it's JSON structure.
   * @param {string} file - Markdown file
   * @return {Object}
   */
  async toJSON (file) {
    const { data, content } = matter(file)

    // Compile markdown from file content to JSON
    const body = await this.generateBody(content)
    // Generate toc from body
    const toc = this.generateToc(body)

    return {
      ...data,
      toc,
      body,
      text: content
    }
  }
}

module.exports = Markdown
