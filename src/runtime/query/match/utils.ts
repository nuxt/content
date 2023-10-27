import type { SortOptions } from '../../types'

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

export const detectProperties = (keys: string[]) => {
  const prefixes = []
  const properties = []
  for (const key of keys) {
    if (['$', '_'].includes(key)) {
      prefixes.push(key)
    } else {
      properties.push(key)
    }
  }
  return { prefixes, properties }
}

export const withoutKeys = (keys: string[] = []) => (obj: any) => {
  if (keys.length === 0 || !obj) {
    return obj
  }
  const { prefixes, properties } = detectProperties(keys)
  return _pick(obj, key => !properties.includes(key) && !prefixes.includes(key[0]))
}

export const withKeys = (keys: string[] = []) => (obj: any) => {
  if (keys.length === 0 || !obj) {
    return obj
  }
  const { prefixes, properties } = detectProperties(keys)
  return _pick(obj, key => properties.includes(key) || prefixes.includes(key[0]))
}
/**
 * Sort list of items by givin options
 */
export const sortList = (data: any[], params: SortOptions) => {
  const comperable = new Intl.Collator(params.$locale as string, {
    numeric: params.$numeric as boolean,
    caseFirst: params.$caseFirst as any,
    sensitivity: params.$sensitivity as any
  })
  const keys = Object.keys(params).filter(key => !key.startsWith('$'))
  for (const key of keys) {
    data = data.sort((a, b) => {
      const values = [get(a, key), get(b, key)]
        .map((value) => {
          // `null` values are treated as `"null"` strings and ordered alphabetically
          // Turn `null` values into `undefined` so they place at the end of the list
          if (value === null) {
            return undefined
          }
          // Convert Date object to ISO string
          if (value instanceof Date) {
            return value.toISOString()
          }
          return value
        })
      if (params[key as keyof SortOptions] === -1) {
        values.reverse()
      }
      return comperable.compare(values[0], values[1])
    })
  }

  return data
}

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
export const ensureArray = <T>(value: T) => {
  return (Array.isArray(value) ? value : [undefined, null].includes(value as any) ? [] : [value]) as T extends Array<any> ? T : T[]
}
