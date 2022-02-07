import type { QueryMatchOperator } from '../../types'
import { assertArray, ensureArray, get } from './utils'

interface MatchFactoryOptions {
  operators?: Record<string, QueryMatchOperator>
}

export function createMatch (opts: MatchFactoryOptions = {}) {
  const operators = createOperators(match, opts.operators)

  function match (item: any, conditions: any): boolean {
    return Object.keys(conditions || {}).every((key) => {
      const condition = conditions[key]

      if (key.startsWith('$')) {
        const fn = operators[key]
        return typeof fn === 'function' ? fn(item, condition) : false
      }

      const value = get(item, key)

      if (typeof condition === 'object') {
        return match(value, condition)
      }

      return value === condition
    })
  }

  return match
}

function createOperators (match: (...args: any[]) => boolean, operators: Record<string, QueryMatchOperator> = {}) {
  return <Record<string, QueryMatchOperator>>{
    $match: (item, condition) => match(item, condition),

    // Match is condition is false
    $not: (item, condition) => !match(item, condition),

    // Match only if all of nested conditions are true
    $and: (item, condition: Array<any>) => {
      assertArray(condition, '$and requires an array as condition')

      return condition.every(cond => match(item, cond))
    },

    // Match if any of nested conditions is true
    $or: (item, condition: Array<any>) => {
      assertArray(condition, '$or requires an array as condition')

      return condition.some(cond => match(item, cond))
    },

    // Match if item Not Equals condition
    $ne: (item, condition) => item !== condition,

    // Match if item Equals condition
    $eq: (item, condition) => item === condition,

    // Match if items is in condition array
    $in: (item, condition) => ensureArray(condition).includes(item),

    // Match it item contains every condition or math every rule in condition array
    $contains: (item, condition) => {
      item = Array.isArray(item) ? item : String(item)
      return ensureArray(condition).every((i: any) => item.includes(i))
    },

    // Ignore case contains
    $icontains: (item, condition) => {
      if (typeof condition !== 'string') {
        throw new TypeError('$icontains requires a string, use $contains instead')
      }

      item = String(item).toLocaleLowerCase()
      return ensureArray(condition).every((i: any) => item.includes(i.toLocaleLowerCase()))
    },

    // Match if item is contains at least one rule from condition array
    $containsAny: (item, condition) => {
      assertArray(condition, '$containsAny requires an array as condition')

      item = Array.isArray(item) ? item : String(item)
      return condition.some((i: any) => item.includes(i))
    },

    // Check whether key exists in document or not
    $exists: (item, condition) => (condition ? typeof item !== 'undefined' : typeof item === 'undefined'),

    // Match if type of item equals condition
    $type: (item, condition) => (typeof item as string) === String(condition),
    ...(operators || {})
  }
}
