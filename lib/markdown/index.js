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

const handlers = require('./handlers')

class Markdown {
  /**
   * Converts markdown document to it's JSON structure.
   * @param {string} markdown - Markdown content
   * @return {Object}
   */
  generateToc (markdown) {

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
        .use(externalLinks)
        .use(remark2rehype, { handlers })
        .use(minifyWhiteSpace)
        .use(sortValues)
        .use(sortAttrs)
        .use(require('./compilers/json'))
        .process(markdown, (error, file) => {
          if (error) {
            return reject(error)
          }
          resolve(file.result)
        })
    })
  }
}

module.exports = Markdown
