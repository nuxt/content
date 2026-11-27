import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CacheDriver } from 'comark-content'

/** Cache driver storing one file per key in `dir`, so servers can share it. */
export function fileDriver(dir: string): CacheDriver {
  mkdirSync(dir, { recursive: true })
  const file = (key: string) => join(dir, encodeURIComponent(key))
  return {
    getItem: (key) => {
      try {
        return readFileSync(file(key), 'utf8')
      }
      catch {
        return null
      }
    },
    setItem: (key, value) => writeFileSync(file(key), value),
    removeItem: key => rmSync(file(key), { force: true }),
    getKeys: base => readdirSync(dir).map(decodeURIComponent).filter(key => key.startsWith(base)),
  }
}
