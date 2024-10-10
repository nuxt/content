export function parseJsonFields<T>(doc: T, jsonFields: Array<string | keyof T>) {
  const item = { ...doc } as T
  for (const key of (jsonFields as Array<keyof T>)) {
    if (item[key] && item[key] !== 'undefined') {
      item[key] = JSON.parse(item[key] as string)
    }
  }

  for (const key in item) {
    if (item[key] === 'NULL') {
      item[key as keyof T] = undefined as unknown as T[keyof T]
    }
  }
  return item
}
