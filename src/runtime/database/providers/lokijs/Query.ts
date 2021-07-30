import { $fetch } from 'ohmyfetch'
import { apply, omit, pick } from '../../../utils/object'
import { BaseQueryBuiler } from '../../Query'

export default class LokiQuery<T> extends BaseQueryBuiler<T> {
  private base = ''
  private db: any
  private lokiQuery: any
  private options: any = {}

  constructor(to: string, { postprocess = [], base = '', db = null, ...params } = {}) {
    super()
    this.base = base

    Object.assign(this.params, params)
    this.params.to = this.params.to || to
    this.db = db

    if (!Array.isArray(postprocess)) {
      this.options.postprocess = postprocess ? [postprocess] : []
    }
  }

  /**
   * Call server middleware with generated params
   * @returns {(Object|Array)} Returns processed data
   */
  remoteFetch() {
    return $fetch(this.base, {
      method: 'POST',
      body: JSON.stringify(this.params),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async initDBFromDataUrl(dataUrl: string) {
    let Loki = require('@lokidb/loki')
    Loki = Loki.default || Loki
    const db = new Loki('content.db')
    const items = db.addCollection('items')
    const { body: navigation } = await $fetch(dataUrl)

    function index(item: any) {
      // insert pages an non-page document to navigation object for search purpose
      items.insert({ ...item, children: undefined })
      if (item.children) {
        item.children.forEach(index)
      }
    }
    Object.values(navigation || {})
      .flatMap(i => i)
      .forEach(index)
    return db
  }

  async fetch(params = this.params): Promise<T | T[]> {
    if (!this.db) {
      return this.remoteFetch()
    }

    if (typeof this.db === 'string') {
      this.db = await this.initDBFromDataUrl(this.db)
    }

    const { postprocess = [] } = this.options

    if (params.surround) {
      const surroundPostProcessor = this.processSurround(params)
      postprocess.push(surroundPostProcessor)
    }

    // eslint-disable-next-line
    const { to, sortBy, skip, limit, only, without, where, search, surround, deep, text, ...other } = params

    postprocess.push((data: any) => (!deep && data[0]?.to === to ? data[0] : data))
    if (!text) {
      // Remove text field from response
      postprocess.unshift(apply(omit(['text'])))
    }

    const condition = { $or: [{ to }, { to: deep ? { $regex: new RegExp(`^${to}`) } : to }] }
    this.lokiQuery = this.db.getCollection('items').chain().find(condition, !deep)

    if (where) {
      const conditions = this.prccessWhere(Object.assign({}, where, other))

      this.lokiQuery = this.lokiQuery.find(conditions)
    }

    if (sortBy && sortBy.length) {
      this.lokiQuery = this.lokiQuery.compoundsort(this.processSort(sortBy))
    }

    if (skip) {
      this.lokiQuery = this.lokiQuery.offset(skip)
    }

    if (limit) {
      postprocess.push((docs: []) => docs.slice(0, limit))
    }

    // Handle only keys
    if (only && only.length) {
      // Map data and returns object picked by keys
      const fn = apply(pick(only))

      // Apply pick during postprocess
      postprocess.unshift(fn)
    }
    // Handle without keys
    if (without && without.length) {
      // Map data and returns object picked by keys
      const fn = apply(omit(without))

      // Apply pick during postprocess
      postprocess.unshift(fn)
    }

    // Collect data without meta fields
    let data = this.lokiQuery.data({ removeMeta: true })

    // Apply postprocess fns to data
    data = postprocess.reduce((data: any, fn: any) => fn(data), data)

    if (!data) {
      throw new Error('not found')
    }

    return JSON.parse(JSON.stringify(data))
  }

  /**
   * Surround results
   * @param {string} slugOrTo - Slug or path of the file to surround.
   * @param {Object} options - Options to surround (before / after).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  private processSurround(params: any) {
    const {
      slugOrTo,
      options: { before = 1, after = 1 }
    } = params.surround
    const _key = slugOrTo.indexOf('/') === 0 ? 'to' : 'slug'

    // Add slug or path to onlyKeys if only method has been called before
    if (params.only) {
      params.only.push(_key)
    }
    // Remove slug or path from withoutKeys if without method has been called before
    if (params.without) {
      params.without = params.without.filter((key: string) => key !== _key)
    }

    const fn = (data: any) => {
      const index = data.findIndex((item: any) => item[_key] === slugOrTo)
      const slice = new Array(before + after).fill(null, 0)
      if (index === -1) {
        return slice
      }

      const prevSlice = data.slice(index - before, index)
      const nextSlice = data.slice(index + 1, index + 1 + after)

      let prevIndex = 0
      for (let i = before - 1; i >= 0; i--) {
        slice[i] = prevSlice[prevIndex] || null
        prevIndex++
      }

      let nextIndex = 0
      for (let i = before; i <= after; i++) {
        slice[i] = nextSlice[nextIndex] || null
        nextIndex++
      }

      return slice
    }

    return fn
  }

  private prccessWhere(where: any) {
    const result: any = {}

    for (const [key, value] of Object.entries(where)) {
      const [field, operator] = key.split('_')

      if (operator) {
        result[field] = {
          [`$${operator}`]: value
        }
      } else {
        result[field] = value
      }
    }
    return result
  }

  private processSort(sortBy: any) {
    const result = []
    if (sortBy) {
      if (Array.isArray(sortBy)) {
        for (const sort of sortBy) {
          if (Array.isArray(sort)) {
            result.push(sort)
          } else if (typeof sort === 'string') {
            result.push(sort.split(':'))
          } else {
            result.push(...Object.entries(sort))
          }
        }
      } else if (typeof sortBy === 'object') {
        result.push(...Object.entries(sortBy))
      } else {
        result.push(sortBy.split(':'))
      }
    }
    return result
  }
}
