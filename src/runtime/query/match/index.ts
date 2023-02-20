import type { QueryMatchOperator } from '../../types'
import { assertArray, ensureArray, get } from './utils'

interface MatchFactoryOptions {
  operators?: Record<string, QueryMatchOperator>
}

export function createMatch (opts: MatchFactoryOptions = {}) {
  const operators = createOperators(match, opts.operators)

  function match (item: any, conditions: any): boolean {
    // Match Regex and simple values
    if (typeof conditions !== 'object' || conditions instanceof RegExp) {
      return operators.$eq(item, conditions)
    }

    return Object.keys(conditions || {}).every((key) => {
      const condition = conditions[key]

      if (key.startsWith('$') && operators[key]) {
        const fn = operators[key]
        return typeof fn === 'function' ? fn(item, condition) : false
      }

      return match(get(item, key), condition)
    })
  }

  return match
}

function createOperators (match: (...args: any[]) => boolean, operators: Record<string, QueryMatchOperator> = {}) {
  return <Record<string, QueryMatchOperator>> {
    $match: (item, condition) => match(item, condition),

    /**
     * Match if item equals condition
     **/
    $eq: (item: any, condition: any) => condition instanceof RegExp ? condition.test(item) : item === condition,

    /**
     * Match if item not equals condition
     **/
    $ne: (item: any, condition: any) => condition instanceof RegExp ? !condition.test(item) : item !== condition,

    /**
     * Match is condition is false
     **/
    $not: (item, condition) => !match(item, condition),

    /**
     * Match only if all of nested conditions are true
     **/
    $and: (item, condition: Array<any>) => {
      assertArray(condition, '$and requires an array as condition')

      return condition.every(cond => match(item, cond))
    },

    /**
     * Match if any of nested conditions is true
     **/
    $or: (item, condition: Array<any>) => {
      assertArray(condition, '$or requires an array as condition')

      return condition.some(cond => match(item, cond))
    },

    /**
     * Match if item is in condition array
     **/
    $in: (item, condition) => ensureArray(condition).some(
      (cond: any) => Array.isArray(item) ? match(item, { $contains: cond }) : match(item, cond)
    ),

    /**
     * Match if item contains every condition or math every rule in condition array
     **/
    $contains: (item, condition) => {
      item = Array.isArray(item) ? item : String(item)
      return ensureArray(condition).every((i: any) => item.includes(i))
    },

    /**
     * Ignore case contains
     **/
    $icontains: (item, condition) => {
      if (typeof condition !== 'string') {
        throw new TypeError('$icontains requires a string, use $contains instead')
      }

      item = String(item).toLocaleLowerCase()
      return ensureArray(condition).every((i: any) => item.includes(i.toLocaleLowerCase()))
    },

    /**
     * Match if item contains at least one rule from condition array
     */
    $containsAny: (item, condition) => {
      assertArray(condition, '$containsAny requires an array as condition')

      item = Array.isArray(item) ? item : String(item)
      return condition.some((i: any) => item.includes(i))
    },

    /**
     * Check key existence
     */
    $exists: (item, condition) => (condition ? typeof item !== 'undefined' : typeof item === 'undefined'),

    /**
     * Match if type of item equals condition
     */
    $type: (item, condition) => (typeof item as string) === String(condition),

    /**
     * Provides regular expression capabilities for pattern matching strings.
     */
    $regex: (item, condition) => {
      if (!(condition instanceof RegExp)) {
        const matched = String(condition).match(/\/(.*)\/([dgimsuy]*)$/)
        condition = matched ? new RegExp(matched[1], matched[2] || '') : new RegExp(condition)
      }

      return condition.test(String(item || ''))
    },

    /**
     * Check if item is less than condition
     */
    $lt: (item, condition) => {
      return item < condition
    },

    /**
     * Check if item is less than or equal to condition
     */
    $lte: (item, condition) => {
      return item <= condition
    },

    /**
     * Check if item is greater than condition
     */
    $gt: (item, condition) => {
      return item > condition
    },

    /**
     * Check if item is greater than or equal to condition
     */
    $gte: (item, condition) => {
      return item >= condition
    },

    ...(operators || {})
  }
}
