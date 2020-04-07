const { pick, omit } = require('../utils')

class QueryBuilder {
  constructor ({ query, preprocess = [], postprocess = [] }, options) {
    this.query = query
    this.preprocess = preprocess
    this.postprocess = postprocess
    this.options = options || {}

    // Remove text field from response
    this.postprocess.unshift(data => data.map(obj => omit(obj, ['text'])))
  }

  /**
   * Select a subset of fields
   * @param {array} keys - Array of fields to be picked.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  fields (keys) {
    // Map data and returns object picked by keys
    const fn = data => data.map(obj => pick(obj, keys))
    // Apply pick during postprocess after data is collected
    this.postprocess.unshift(fn)
    // Return current instance
    return this
  }

  /**
   * Sort results
   * @param {string} field - Field key to sort on.
   * @param {string} direction - Direction of sort (asc / desc).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  sortBy (field, direction) {
    this.query = this.query.simplesort(field, { desc: direction === 'desc' })
    return this
  }

  /**
   * Filter results
   * @param {object} obj - Where query.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  where (obj) {
    this.query = this.query.find(obj)
    return this
  }

  /**
   * Search results
   * @param {(object|string)} query - Search query object or field or search value.
   * @param {string} value - Value of search (means query equals to field).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  search (query, value) {
    let $fts

    if (typeof query === 'object') {
      $fts = query
    } else if (value) {
      $fts = {
        query: {
          type: 'match',
          field: query,
          value,
          prefix_length: 1,
          fuzziness: 1,
          extended: true,
          minimum_should_match: 1
        }
      }
    } else {
      $fts = {
        query: {
          type: 'bool',
          should: this.options.fullTextSearchFields.map(field => ({
            type: 'match',
            field,
            value: query,
            prefix_length: 1,
            operator: 'and',
            fuzziness: 1,
            extended: true
          })),
          minimum_should_match: 1
        }
      }
    }

    this.query = this.query.find({ $fts })
    return this
  }

  /**
   * Limit number of results
   * @param {number} n - Limit number.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  limit (n) {
    if (typeof n === 'string') { n = parseInt(n) }

    this.query = this.query.limit(n)
    return this
  }

  /**
   * Skip number of results
   * @param {number} n - Skip number.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  skip (n) {
    if (typeof n === 'string') { n = parseInt(n) }

    this.query = this.query.offset(n)
    return this
  }

  /**
   * Collect data and apply process filters
   * @returns {(Object|Array)} Returns processed data
   */
  fetch () {
    // Apply preprocess fns to query
    for (const fn of this.preprocess) {
      this.query = fn(this.query)
    }
    // Collect data without meta fields
    let data = this.query.data({ removeMeta: true })
    // Apply postprocess fns to data
    for (const fn of this.postprocess) {
      data = fn(data)
    }

    if (!data) {
      throw new Error('Not found')
    }

    return data
  }
}

module.exports = QueryBuilder
