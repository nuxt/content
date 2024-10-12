import type { Database } from '@sqlite.org/sqlite-wasm'
import { measurePerformance } from './performance'
import { decompressSQLDump } from './decompressSQLDump'
import { integrityVersion } from '#content-v3/integrity'

let db: Database & { collections?: Record<string, { jsonFields: string[] }> }

export async function prepareLocalDatabase() {
  if (!db || !db.collections) {
    const perf = measurePerformance()
    let compressedDump: string | null = null
    let collections: Record<string, { jsonFields: string[] }> | null = null

    if (!import.meta.dev) {
      const localCacheVersion = window.localStorage.getItem('content-integrity-version')
      if (localCacheVersion === integrityVersion) {
        compressedDump = window.localStorage.getItem('content-dump')
        const localCollections = window.localStorage.getItem('content-collections')
        if (localCollections) {
          collections = JSON.parse(localCollections)
        }
      }
    }

    perf.tick('Get Local Cache')
    if (!compressedDump || !collections) {
      const response = await $fetch<{ dump: string, collections: Record<string, { jsonFields: string[] }> }>('/api/database.json', {
        headers: { 'content-type': 'application/json' },
        query: { v: integrityVersion },
      })
      compressedDump = response.dump
      collections = response.collections as unknown as Record<string, { jsonFields: string[] }>

      perf.tick('Download Database')
      if (!import.meta.dev) {
        try {
          window.localStorage.setItem('content-integrity-version', integrityVersion)
          window.localStorage.setItem('content-dump', compressedDump!)
          window.localStorage.setItem('content-collections', JSON.stringify(collections))
        }
        catch (error) {
          console.log('Database integrity check failed, rebuilding database', error)
        }
        perf.tick('Store Database')
      }
    }

    const dump = await decompressSQLDump(compressedDump!)
    perf.tick('Decompress Database')

    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    const sqlite3 = await sqlite3InitModule()
    perf.tick('Import SQLite Module')

    db = new sqlite3.oo1.DB()
    db.collections = collections

    for (const command of dump) {
      await db.exec(command)
    }
    perf.tick('Restore Dump')

    perf.end('Initialize Database')
  }

  return db
}
