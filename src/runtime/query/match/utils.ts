import { SortFields, SortParams } from '../../types'

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
 * Sort list of items by givin options
 */
export const sortList = (data: any[], params: SortFields & SortParams) => {
  if (params.length === 0) {
    return data
  }
  const comperable = new Intl.Collator(params.$locale as string, {
    numeric: params.$numeric as boolean,
    caseFirst: params.$caseFirst as string,
    sensitivity: params.$sensitivity as string
  })
  const keys = Object.keys(params).filter(key => !key.startsWith('$'))
  for (const key of keys) {
    data = data.sort((a, b) => {
      const values = [get(a, key), get(b, key)]
      if (params[key] === 0) {
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
export const ensureArray = <T>(value: T) =>
(Array.isArray(value) ? value : value ? [value] : []) as T extends Array<any> ? T : T[]
