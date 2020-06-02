const matter = require('gray-matter')
const { camelCase } = require('change-case')
const unified = require('unified')
const parse = require('remark-parse')
const remark2rehype = require('remark-rehype')
const logger = require('consola').withScope('@nuxt/content')

const handlers = require('./handlers')
const jsonCompiler = require('./compilers/json')

class Markdown {
  constructor (options = {}) {
    this.options = options

    this.remarkPlugins = this.preparePluginsFor('remark')
    this.rehypePlugins = this.preparePluginsFor('rehype')
  }

  preparePluginsFor (type) {
    const plugins = []

    for (const plugin of this.options[`${type}Plugins`]) {
      let name
      let options

      if (typeof plugin === 'string') {
        name = plugin
        options = this.options[camelCase(name)]
      } else if (Array.isArray(plugin)) {
        [name, options] = plugin
      }

      try {
        const instance = require(this.options.nuxt.resolver.resolvePath(name))

        plugins.push({ instance, options })
      } catch (e) {
        logger.error(e.toString())
      }
    }

    return plugins
  }

  processPluginsFor (type, stream) {
    for (const { instance, options } of this[`${type}Plugins`]) {
      stream = stream.use(instance, options)
    }

    return stream
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

      let text
      const child = node.children.find(child => child.type === 'text')
      if (child) {
        text = child.value
      } else {
        const elements = node.children.filter(child => child.type === 'element')
        for (const element of elements) {
          const child = element.children.find(child => child.type === 'text')
          if (child) {
            text = child.value
          }
        }
      }

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
  generateBody (content) {
    return new Promise((resolve, reject) => {
      let stream = unified().use(parse)

      stream = this.processPluginsFor('remark', stream)
      stream = stream.use(remark2rehype, { handlers, allowDangerousHtml: true })
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
