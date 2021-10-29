import { $fetch } from 'ohmyfetch'
import { apply, omit, pick } from '../../../utils/object'
import { BaseQueryBuilder } from '../../Query'
import { match } from './operations'
import { sortByKey } from './utils'

export default class Query<T> extends BaseQueryBuilder<T> {
  items: any[] = []
  base: string
  dbUrl: string = ''

  constructor(to: string, { base = '', db = null, ...params }: any = {}) {
    super()
    this.base = base

    Object.assign(this.params, params)
    this.params.to = this.params.to || to
    this.items = db

    if (typeof db === 'string') {
      this.dbUrl = db
    }
  }

  /**
   * Call server middleware with generated params
   * @returns {(Object|Array)} Returns processed data
   */
  remoteFetch() {
    return globalThis.$fetch(this.base, {
      method: 'POST',
      body: JSON.stringify(this.params),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async initDBFromNavigationData(dataUrl: string) {
    const { body: navigation } = await $fetch(dataUrl)
    const _items: any[] = []
    function index(item: any) {
      // insert pages an non-page document to navigation object for search purpose
      _items.push({ ...item, children: undefined })
      if (item.children) {
        item.children.forEach(index)
      }
    }
    Object.values(navigation || {})
      .flatMap(i => i)
      .forEach(index)
    return _items
  }

  async fetch(params = this.params): Promise<T | T[]> {
    if (this.dbUrl) {
      this.items = await this.initDBFromNavigationData(this.dbUrl)
    }

    if (!this.items) {
      return this.remoteFetch()
    }
    const data = this.items
    params = params || this.params

    const pipelines = [
      // Filter items based on `params.to`
      (data: any[]) => (params.to ? data.filter(item => item.to === params.to || item.to.startsWith(params.to)) : data),
      // Conditions
      (data: any[]) => data.filter(item => match(item, params.where)),
      // Sort data
      (data: any[]) => params.sortBy.forEach(([key, direction]) => sortByKey(data, key, direction)),
      // Skip first items
      (data: any[]) => (params.skip ? data.slice(params.skip) : data),
      // Pick first items
      (data: any[]) => (params.limit ? data.slice(0, params.limit) : data),
      // Remove unwanted fields
      apply(omit(params.without)),
      // Select only wanted fields
      apply(pick(params.only)),
      // Evaluate result
      (data: any[]) => (!params.deep && data[0]?.to === params.to ? data[0] : data)
    ]

    const result = pipelines.reduce((value: any, fn: any) => fn(value) || value, data)

    return result
  }
}
