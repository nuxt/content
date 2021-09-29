// @ts-nocheck
import { apply, omit, pick } from '../../../utils/object'
import { BaseQueryBuiler } from '../../Query'

const sorComparable = (key: string, direction: string | boolean) => (a: any, b: any) => {
  const values = [a, b]
  if (direction === 'desc' || direction === true) {
    values.reverse()
  }
  return String(a[key] || '').localeCompare(b[key])
}

function matchOperator(item: any, operator: string, value: any) {
  switch (operator) {
    case '$ne':
      return item !== value
    case '$eq':
      return item === value
    default:
      return false
  }
}

function match(item: any, where: any) {
  return Object.keys(where || {}).every(key => {
    const value = where[key]
    if (typeof value === 'object') {
      return match(item[key], value)
    }
    if (key.startsWith('$')) {
      return matchOperator(item, key, value)
    }
    return item[key] === value
  })
}

export default class ArrayQuery<T> extends BaseQueryBuiler<T> {
  items: any[] = []
  params: any = {}

  constructor(to: string, { base = '', db = null, ...params } = {}) {
    super()
    this.base = base

    Object.assign(this.params, params)
    this.params.to = this.params.to || to
    this.items = db
  }

  fetch(params?: any): any {
    params = params || this.params

    const data = this.items

    const pipelines = [
      // where
      (data: any[]) => {
        return data.filter(item => match(item, params.where))
      },
      // Sort data
      (data: any[]) => {
        params.sortBy.forEach(([key, direction]) => data.sort(sorComparable(key, direction)))
      },
      // Remove unwanted fields
      apply(omit(params.without)),
      // Select only wanted fields
      apply(pick(params.only)),
      // Skip first items
      (data: any[]) => (params.skip ? data.slice(params.skip) : data),
      // Pick first items
      (data: any[]) => (params.limit ? data.slice(0, params.limit) : data),
      (data: any[]) => (!params.deep && data[0]?.to === params.to ? data[0] : data)
    ]

    const result = pipelines.reduce((value: any, fn: any) => fn(value) || value, data)

    return result
  }
}
