const csv = require('csvtojson')

class CSV {
  constructor (options = {}) {
    this.options = options
  }

  /**
   * Converts csv document to it's JSON structure.
   * @param {string} file - Csv file
   * @return {Object}
   */
  async toJSON (file) {
    const body = await csv({ output: 'json', ...this.options }).fromString(file)

    return {
      body
    }
  }
}

module.exports = CSV
