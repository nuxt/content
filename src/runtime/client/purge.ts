// runtime/client/purge.ts
export async function purgeContentCaches(collection?: string) {
  // IndexedDB (best effort)
  try {
    const names = [
      'nuxt_content',
      'nuxt_content_queries',
      collection && `content_${collection}`,
      collection && `content-db-${collection}`,
    ].filter(Boolean) as string[]
    for (const n of names) {
      try {
        indexedDB.deleteDatabase(n)
      }
      catch (err) {
        console.warn('Failed to delete database', n, err)
      }
    }

    // Chrome: enumerate and delete content-like DBs
    // @ts-expect-error non-standard
    if (indexedDB.databases) {
      // @ts-expect-error non-standard
      const dbs: Array<{ name?: string }> = await indexedDB.databases()
      for (const db of dbs) {
        const n = db.name || ''
        const match = collection ? n.includes(collection) : true
        if (match && /nuxt|content|sqlite|wasm/i.test(n)) {
          try {
            indexedDB.deleteDatabase(n)
          }
          catch (err) {
            console.warn('Failed to delete database', n, err)
          }
        }
      }
    }
  }
  catch (err) {
    console.warn('Failed to purge IndexedDB content caches', err)
  }

  // localStorage (your exact patterns)
  try {
    const exact = [
      collection && `content_checksum_${collection}`,
      collection && `content_collection_${collection}`,
      'hint_reveal_timestamp',
    ].filter(Boolean) as string[]
    for (const k of exact) {
      try {
        localStorage.removeItem(k)
      }
      catch (err) {
        console.warn('Failed to remove localStorage item', k, err)
      }
    }

    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('content_checksum_') || k.startsWith('content_collection_')) {
        try {
          localStorage.removeItem(k)
        }
        catch (err) {
          console.warn('Failed to remove localStorage item', k, err)
        }
      }
    }
  }
  catch (err) {
    console.warn('Failed to purge localStorage content caches', err)
  }
}
