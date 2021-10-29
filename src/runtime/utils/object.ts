const _pick = (obj: any, condition: (item: any) => boolean) =>
  Object.keys(obj)
    .filter(condition)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})

/**
 * Returns a new object with the specified keys
 **/
export const pick = (keys: string[]) => (obj: any) => keys && keys.length ? _pick(obj, key => keys.includes(key)) : obj

/**
 * Returns a new object with all the keys of the original object execept the ones specified.
 **/
export const omit = (keys: string[]) => (obj: any) => keys && keys.length ? _pick(obj, key => !keys.includes(key)) : obj

export const apply = (fn: (d: any) => any) => (data: any) => Array.isArray(data) ? data.map(item => fn(item)) : fn(data)
