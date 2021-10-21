export default class QueryBuilder {
  constructor (url, { deep = false, text = false } = {}) {
    this.url = url
    this.params = {
      deep,
      text
    }
  }

  /**
   * Select a subset of fields
   * @param {Array} keys - Array of fields to be picked.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  only (keys) {
    this.params.only = keys
    return this
  }

  /**
   * Remove a subset of fields
   * @param {Array} keys - Array of fields to be picked.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  without (keys) {
    this.params.without = keys
    return this
  }

  /**
   * Sort results
   * @param {string} field - Field key to sort on.
   * @param {string} direction - Direction of sort (asc / desc).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  sortBy (field, direction = 'asc') {
    this.params.sortBy = this.params.sortBy || []
    this.params.sortBy.push({ [field]: direction })
    return this
  }

  /**
   * Filter results
   * @param {Object} query - Where query.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  where (query) {
    this.params.where = query
    return this
  }

  /**
   * Search results
   * @param {(Object|string)} query - Search query object or field or search value.
   * @param {string} value - Value of search (means query equals to field).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  search (query, value) {
    this.params.search = { query, value }
    return this
  }

  /**
   * Surround results
   * @param {string} slugOrPath - Slug or path of the file to surround.
   * @param {Object} options - Options to surround (before / after).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  surround (slugOrPath, options) {
    this.params.surround = { slugOrPath, options }
    return this
  }

  /**
   * Limit number of results
   * @param {number} n - Limit number.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  limit (n) {
    this.params.limit = n
    return this
  }

  /**
   * Skip number of results
   * @param {number} n - Skip number.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  skip (n) {
    this.params.skip = n
    return this
  }

  /**
   * Call server middleware with generated params
   * @returns {(Object|Array)} Returns processed data
   */
  fetch () {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(this.params),
      headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
      if (!response.ok) {
        const error = new Error(response.statusText)
        error.response = response
        throw error
      }
      return response.json()
    })
  }
}
