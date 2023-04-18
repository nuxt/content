/**
 * Creates a predicate to test storage keys `foo:bar:baz` against configured `ignores` patterns
 */
export function makeIgnored (content: { ignores: string[], experimental: { ignores?: string[] } }): (key: string) => boolean {
  // 2.7+ supports free regexp + slashes
  if (content.experimental.ignores) {
    const ignores = content.experimental.ignores
    const defaults = ['/\\.', '/-']
    const rxAll = [...defaults, ...ignores].map(p => new RegExp(p))
    return function isIgnored (key: string): boolean {
      const path = '/' + key.replaceAll(':', '/')
      return rxAll.some(rx => rx.test(path))
    }
  }

  // 2.6 prefixed by unstorage delimiters
  const ignores = content.ignores
  const defaults = ['\\.', '-']
  const rxAll = [...defaults, ...ignores].map(p => new RegExp(`^${p}|:${p}`))
  return function isIgnored (key: string): boolean {
    return rxAll.some(rx => rx.test(key))
  }
}
