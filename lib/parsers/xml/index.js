const xml = require('xml2json')

class XML {
  constructor (options = {}) {
    this.options = options
  }

  /**
   * Converts xml document to it's JSON structure.
   * @param {string} file - xml file
   * @return {Object}
   */
  async toJSON (file) {
    const body = await xml.toJson(file, this.options)

    return {
      body
    }
  }
}

module.exports = XML
