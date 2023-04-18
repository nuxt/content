/**
 * Creates a predicate to test storage keys `foo:bar:baz` against configured `ignores` patterns
 */
export function makeIgnored (content: { ignores: string[], experimental: { advancedIgnoresPattern: boolean } }): (key: string) => boolean {
  // 2.7+ supports free regexp + slashes
  if (content.experimental.advancedIgnoresPattern) {
    const rxAll = ['/\\.', '/-', ...content.ignores].map(p => new RegExp(p))
    return function isIgnored (key: string): boolean {
      const path = '/' + key.replaceAll(':', '/')
      return rxAll.some(rx => rx.test(path))
    }
  }

  // 2.6 prefixed by unstorage delimiters
  const rxAll = ['\\.', '-', ...content.ignores].map(p => new RegExp(`^${p}|:${p}`))
  return function isIgnored (key: string): boolean {
    return rxAll.some(rx => rx.test(key))
  }
}
