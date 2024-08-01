import { assertArray, ensureArray, get } from './utils'

interface MatchFactoryOptions {
  operators?: Record<string, (column: string, condition: any) => string>
}

export function createMatch(opts: MatchFactoryOptions = {}) {
  const operators = createOperators(match, opts.operators)

  function match(column: string, conditions: any): string {
    // Match Regex and simple values
    if (typeof conditions !== 'object' || conditions instanceof RegExp) {
      return operators.$eq!(column, conditions)
    }

    return Object.keys(conditions || {}).map((key) => {
      const condition = conditions[key]

      if (key.startsWith('$') && operators[key]) {
        const fn = operators[key]
        return typeof fn === 'function' ? fn(column, condition) : 'FALSE'
      }

      return match(key, condition)
    }).join(' AND ')
  }

  return match
}

function createOperators(match: (column: string, conditions: any) => string, operators: Record<string, (column: string, condition: any) => string> = {}) {
  return <Record<string, (column: string, condition: any) => string>> {
    $match: (column, condition) => match(column, condition),

    /**
     * Match if item equals condition
     */
    $eq: (column: string, condition: any) => condition instanceof RegExp ? `${column} REGEXP '${condition.source}'` : `${column} = '${condition}'`,

    /**
     * Match if item not equals condition
     */
    $ne: (column: string, condition: any) => condition instanceof RegExp ? `${column} NOT REGEXP '${condition.source}'` : `${column} != '${condition}'`,

    /**
     * Match if condition is false
     */
    $not: (column, condition) => `NOT (${match(column, condition)})`,

    /**
     * Match only if all of nested conditions are true
     */
    $and: (column, condition: Array<any>) => {
      assertArray(condition, '$and requires an array as condition')
      return `((${condition.map(cond => match(column, cond)).join(') AND (')}))`
    },

    /**
     * Match if any of nested conditions is true
     */
    $or: (column, condition: Array<any>) => {
      assertArray(condition, '$or requires an array as condition')
      return `((${condition.map(cond => match(column, cond)).join(') OR (')}))`
    },

    /**
     * Match if item is in condition array
     */
    $in: (column, condition) => `${column} IN (${ensureArray(condition).map(cond => `'${cond}'`).join(', ')})`,

    /**
     * Match if item contains every condition or match every rule in condition array
     */
    $contains: (column, condition) => {
      return ensureArray(condition).map(i => `${column} LIKE '%${i}%'`).join(' AND ')
    },

    /**
     * Ignore case contains
     */
    $icontains: (column, condition) => {
      if (typeof condition !== 'string') {
        throw new TypeError('$icontains requires a string, use $contains instead')
      }
      return ensureArray(condition).map(i => `LOWER(${column}) LIKE '%${i.toLocaleLowerCase()}%'`).join(' AND ')
    },

    /**
     * Match if item contains at least one rule from condition array
     */
    $containsAny: (column, condition) => {
      assertArray(condition, '$containsAny requires an array as condition')
      return `(${condition.map(i => `${column} LIKE '%${i}%'`).join(' OR ')})`
    },

    /**
     * Check key existence
     */
    $exists: (column, condition) => (condition ? `${column} IS NOT NULL` : `${column} IS NULL`),

    /**
     * Match if type of item equals condition
     */
    $type: (column, condition) => `typeof(${column}) = '${condition}'`,

    /**
     * Provides regular expression capabilities for pattern matching strings.
     */
    $regex: (column, condition) => {
      if (!(condition instanceof RegExp)) {
        const matched = String(condition).match(/\/(.*)\/([dgimsuy]*)$/)
        condition = matched?.[1] ? new RegExp(matched[1], matched[2] || '') : new RegExp(condition)
      }
      return `${column} REGEXP '${condition.source}'`
    },

    /**
     * Check if item is less than condition
     */
    $lt: (column, condition) => `${column} < '${condition}'`,

    /**
     * Check if item is less than or equal to condition
     */
    $lte: (column, condition) => `${column} <= '${condition}'`,

    /**
     * Check if item is greater than condition
     */
    $gt: (column, condition) => `${column} > '${condition}'`,

    /**
     * Check if item is greater than or equal to condition
     */
    $gte: (column, condition) => `${column} >= '${condition}'`,

    ...(operators || {}),
  }
}
