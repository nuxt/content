/**
 * Returns a new object with the specified keys
 */
export function pick(keys?: string[]) {
  return (obj: Record<string, unknown>) => {
    obj = obj || {}
    return (keys || [])
      .filter(key => typeof obj[key] !== 'undefined')
      .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
  }
}
