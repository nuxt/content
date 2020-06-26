const xml = require('xml2json')

class XML {
  constructor (options = {}) {
    this.options = options
  }

  /**
   * Converts csv document to it's JSON structure.
   * @param {string} file - Csv file
   * @return {Object}
   */
  async toJSON (file) {
    const body = await xml.toJson(file, this.options)

    return {
      body
    }
  }
}

module.exports = Csv
