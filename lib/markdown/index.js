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
  constructor (options = {}) {
    this.options = options
  }

  /**
   * Converts markdown document to it's JSON structure.
   * @param {string} markdown - Markdown content
   * @return {Object}
   */
  toJSON (markdown) {
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
        .process(markdown, (error, file) => {
          /* istanbul ignore if */
          if (error) {
            return reject(error)
          }
          resolve(file.result)
        })
    })
  }
}

module.exports = Markdown
