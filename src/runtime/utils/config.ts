/**
 * Creates a predicate to test storage keys against configured `ignores` patterns
 */
export function makeIgnored (ignores: string[]): (key: string) => boolean {
  const ignored = ignores.map(ignore => new RegExp(ignore))
  return function isIgnored (key: string): boolean {
    return ignored.some(rx => rx.test(key))
  }
}
