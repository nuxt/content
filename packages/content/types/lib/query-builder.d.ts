export = QueryBuilder;
declare class QueryBuilder {
    constructor({ query, path, init, text, postprocess }: {
        query: any;
        path: any;
        init: any;
        text: any;
        postprocess?: any[];
    }, options: any);
    query: any;
    path: any;
    init: any;
    postprocess: any[];
    options: any;
    onlyKeys: any[];
    withoutKeys: any;
    sortKeys: any[];
    limitN: number;
    skipN: number;
    /**
     * Select a subset of fields
     * @param {Array} keys - Array of fields to be picked.
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    only(keys: any[]): QueryBuilder;
    /**
     * Remove a subset of fields
     * @param {Array} keys - Array of fields to be picked.
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    without(keys: any[]): QueryBuilder;
    /**
     * Sort results
     * @param {string} field - Field key to sort on.
     * @param {string} direction - Direction of sort (asc / desc).
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    sortBy(field: string, direction: string): QueryBuilder;
    /**
     * Filter results
     * @param {object} query - Where query.
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    where(query: object): QueryBuilder;
    /**
     * Search results
     * @param {(Object|string)} query - Search query object or field or search value.
     * @param {string} value - Value of search (means query equals to field).
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    search(query: (any | string), value: string): QueryBuilder;
    /**
     * Surround results
     * @param {string} slug - Slug of the file to surround.
     * @param {Object} options - Options to surround (before / after).
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    surround(slug: string, { before, after }?: any): QueryBuilder;
    /**
     * Limit number of results
     * @param {number} n - Limit number.
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    limit(n: number): QueryBuilder;
    /**
     * Skip number of results
     * @param {number} n - Skip number.
     * @returns {QueryBuilder} Returns current instance to be chained
     */
    skip(n: number): QueryBuilder;
    /**
     * Collect data and apply process filters
     * @returns {(Object|Array)} Returns processed data
     */
    fetch(): (any | any[]);
}
