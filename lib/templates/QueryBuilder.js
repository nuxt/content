class QueryBuilder {
  constructor (url) {
    this.url = url
    this.params = {}
  }

  /**
   * Select a subset of fields
   * @param {array} keys - Array of fields to be picked.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  fields (keys) {
    this.params.fields = keys
    return this
  }

  /**
   * Sort results
   * @param {string} field - Field key to sort on.
   * @param {string} direction - Direction of sort (asc / desc).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  sortBy (field, direction) {
    this.params.sortBy = this.params.sortBy || []
    this.params.sortBy.push({ [field]: direction })
    return this
  }

  /**
   * Filter results
   * @param {object} where - Where query.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  where (where) {
    this.params.where = where
    return this
  }

  /**
   * Search results
   * @param {object} search - Search query.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  search (search) {
    this.params.search = search
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

module.exports = QueryBuilder
