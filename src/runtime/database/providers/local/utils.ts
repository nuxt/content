import { get } from './operations'

/**
 * Comperator to sort array of objects based on a property
 */
export const sortComparable = (key: string, direction: string | boolean) => (a: any, b: any) => {
  const values = [get(a, key), get(b, key)]
  if (direction === 'desc' || direction === true) {
    values.reverse()
  }

  if (values[0] === undefined) return 1
  if (values[1] === undefined) return -1

  if (values[0] > values[1]) return 1
  if (values[0] < values[1]) return -1
  return 0
}

/**
 * Sort an array based on a key
 */
export const sortByKey = (data: any[], key: string, direction: string | boolean) =>
  data.sort(sortComparable(key, direction))
