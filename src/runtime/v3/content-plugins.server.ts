import sqlQuery from 'comark-content/plugins/sql-query'
import sqliteFullTextSearch from 'comark-content/plugins/sqlite-full-text-search'
import sqlite from 'comark-content/database/sqlite-node'
import type { ContentPlugin } from 'comark-content'
import { v3Enabled } from './content-plugins.shared'
import fileMeta from './file-meta'

export function v3ServerPlugins(enabled?: boolean): ContentPlugin<any>[] {
  if (!v3Enabled(enabled)) return []
  const database = sqlite()
  return [
    fileMeta(),
    sqlQuery({ database }),
    sqliteFullTextSearch({ database }),
  ]
}
