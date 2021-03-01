const yaml = require('js-yaml')

class YAML {
  constructor (options = {}) {
    this.options = options
  }

  /**
   * Converts yaml document to it's JSON structure.
   * @param {string} file - Yaml file
   * @return {Object}
   */
  toJSON (file) {
    return yaml.load(file, { ...this.options, json: true })
  }
}

module.exports = YAML
