import type { H3Event } from 'h3'
import loadDatabaseAdapter from './database.server'
import { integrityVersion } from '#content/manifest'
import { useRuntimeConfig } from '#imports'

export async function loadDatabaseDump(event: H3Event): Promise<string> {
  let dump = ''
  if (event?.context?.cloudflare?.env.ASSETS) {
    const url = new URL(event.context.cloudflare.request.url)
    url.pathname = '/compressed.sql'
    return await event.context.cloudflare.env.ASSETS.fetch(url).then((r: Response) => r.text())
  }

  dump = await $fetch('/api/content/database.json').catch((e) => {
    console.error('Failed to fetch compressed dump', e)
    return ''
  }).then(r => r.dump)
  return dump
}

let checkDatabaseIntegrity = true
let integrityCheckPromise: Promise<void> | null = null
export async function queryContentSqlApi<T>(sql: string, event: H3Event) {
  const conf = useRuntimeConfig().content

  if (import.meta.server && event) {
    if (checkDatabaseIntegrity) {
      checkDatabaseIntegrity = false
      integrityCheckPromise = integrityCheckPromise || import('./database.server')
        .then(m => m.checkAndImportDatabaseIntegrity(event, integrityVersion, conf))
        .then((isValid) => { checkDatabaseIntegrity = !isValid })
        .catch((error) => {
          console.log('Database integrity check failed, rebuilding database', error)
          checkDatabaseIntegrity = true
          integrityCheckPromise = null
        })
    }

    if (integrityCheckPromise) {
      await integrityCheckPromise
    }
  }

  return loadDatabaseAdapter(conf).all<T>(sql)
}
