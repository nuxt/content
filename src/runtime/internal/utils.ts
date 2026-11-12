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

/**
 * Returns a function that yields to the main thread once `budget` ms have
 * passed since the last yield, so a long loop in the browser stays
 * responsive to input. A no-op on the server.
 */
export function createYielder(budget = 40) {
  let start = performance.now()
  return async () => {
    if (typeof window === 'undefined' || performance.now() - start < budget) {
      return
    }
    const { scheduler } = globalThis as { scheduler?: { yield?: () => Promise<void> } }
    await (scheduler?.yield?.() ?? new Promise(resolve => setTimeout(resolve, 0)))
    start = performance.now()
  }
}
