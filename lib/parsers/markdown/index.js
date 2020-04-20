const matter = require('gray-matter')
const unified = require('unified')
const parse = require('remark-parse')
const squeezeParagraphs = require('remark-squeeze-paragraphs')
const slug = require('remark-slug')
const headings = require('remark-autolink-headings')
const externalLinks = require('remark-external-links')
const remark2rehype = require('remark-rehype')
const minifyWhiteSpace = require('rehype-minify-whitespace')
const sortValues = require('rehype-sort-attribute-values')
const sortAttrs = require('rehype-sort-attributes')
const raw = require('rehype-raw')

const handlers = require('./handlers')
const jsonCompiler = require('./compilers/json')

class Markdown {
  constructor (context, options) {
    this.nuxt = context.nuxt
    this.options = options

    if (options.prism.theme) {
      this.nuxt.options.css.push(options.prism.theme)
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
      unified()
        .use(parse)
        .use(slug)
        .use(headings)
        .use(squeezeParagraphs)
        .use(externalLinks, this.options.externalLinks)
        .use(remark2rehype, { handlers, allowDangerousHtml: true })
        .use(raw)
        .use(minifyWhiteSpace)
        .use(sortValues)
        .use(sortAttrs)
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
