export const get = (obj: any, path: string): any => path.split('.').reduce((acc, part) => acc && acc[part], obj)

export function match(item: any, where: any): boolean {
  return Object.keys(where || {}).every(key => {
    const condition = where[key]
    if (key.startsWith('$')) {
      return $operator(item, key, condition)
    }

    const value = get(item, key)

    if (typeof condition === 'object') {
      return match(value, condition)
    }
    return value === condition
  })
}

function $operator(item: any, operator: string, condition: any): boolean {
  switch (operator) {
    // Match is condition is false
    case '$not':
      return !match(item, condition)

    // Match only if all of nested conditions are true
    case '$and':
      if (!Array.isArray(condition)) {
        throw new TypeError('$containsAny requires an array as condition')
      }
      return condition.every(cond => match(item, cond))

    // Match if any of nested conditions is true
    case '$or':
      if (!Array.isArray(condition)) {
        throw new TypeError('$containsAny requires an array as condition')
      }
      return condition.some(cond => match(item, cond))

    // Match if item Not Equals condition
    case '$ne':
      return item !== condition

    // Match if item Equals condition
    case '$eq':
      return item === condition

    // Match if items is in condition array
    case '$in':
      return (Array.isArray(condition) ? condition : [condition]).includes(item)

    // Match it item contains every condition or math every rule in condition array
    case '$contains':
      item = Array.isArray(item) ? item : String(item)
      return Array.isArray(condition) ? condition.every((i: any) => item.includes(i)) : item.includes(condition)

    // Match if item is contains at least one rule from condition array
    case '$containsAny':
      if (!Array.isArray(condition)) {
        throw new TypeError('$containsAny requires an array as condition')
      }
      item = Array.isArray(item) ? item : String(item)
      return condition.some((i: any) => item.includes(i))

    // Check whether key exists in document or not
    case '$exists':
      return condition ? typeof item !== 'undefined' : typeof item === 'undefined'

    // Match if type of item equals condition
    case '$type': {
      const type = typeof item
      return type === String(condition)
    }
    default:
      return false
  }
}
