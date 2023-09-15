/**
 * Creates a predicate to test storage keys `foo:bar:baz` against configured `ignores` patterns
 */
export function makeIgnored (ignores: string[]): (key: string) => boolean {
  const rxAll = ['/\\.', '/-', ...ignores.filter(p => p)].map(p => new RegExp(p))
  return function isIgnored (key: string): boolean {
    const path = '/' + key.replace(/:/g, '/')
    return rxAll.some(rx => rx.test(path))
  }
}
