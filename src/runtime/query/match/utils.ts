/**
 * Retrive nested value from object by path
 */
export const get = (obj: any, path: string): any => path.split('.').reduce((acc, part) => acc && acc[part], obj)

const _pick = (obj: any, condition: (item: any) => boolean) =>
  Object.keys(obj)
    .filter(condition)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})

/**
 * Returns a new object with the specified keys
 **/
export const pick = (keys?: string[]) => (obj: any) => keys && keys.length ? _pick(obj, key => keys.includes(key)) : obj

/**
 * Returns a new object with all the keys of the original object execept the ones specified.
 **/
export const omit = (keys?: string[]) => (obj: any) =>
  keys && keys.length ? _pick(obj, key => !keys.includes(key)) : obj

/**
 * Apply a function to each element of an array
 */
export const apply = (fn: (d: any) => any) => (data: any) => Array.isArray(data) ? data.map(item => fn(item)) : fn(data)

/**
 * Comperator to sort array of objects based on a property
 */
export const sortComparable = (key: string, direction: string | boolean) => (a: any, b: any) => {
  const values = [get(a, key), get(b, key)]
  if (direction === 'desc' || direction === true) {
    values.reverse()
  }

  if (values[0] === undefined) {
    return 1
  }
  if (values[1] === undefined) {
    return -1
  }

  if (values[0] > values[1]) {
    return 1
  }
  if (values[0] < values[1]) {
    return -1
  }
  return 0
}

/**
 * Sort an array based on a key
 */
export const sortByKey = (data: any[], key: string, direction: string | boolean) =>
  data.sort(sortComparable(key, direction))

/**
 * Raise TypeError if value is not an array
 */
export const assertArray = (value: any, message = 'Expected an array') => {
  if (!Array.isArray(value)) {
    throw new TypeError(message)
  }
}

/**
 * Ensure result is an array
 */
export const ensureArray = (value: any) => (Array.isArray(value) ? value : value ? [value] : [])
