const unified = require('unified')
const parse = require('remark-parse')
const remark2rehype = require('remark-rehype')

class Markdown {
  /**
   * Converts markdown document to it's JSON structure.
   * @param {string} markdown - Markdown content
   * @return {Object}
   */
  toJSON (markdown) {
    return new Promise((resolve, reject) => {
      unified()
        .use(parse)
        .use(remark2rehype)
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
