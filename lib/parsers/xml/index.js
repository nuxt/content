const xml = require('xml2js')

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
    const body = await xml.parseStringPromise(file, this.options)

    return {
      body
    }
  }
}

module.exports = XML
