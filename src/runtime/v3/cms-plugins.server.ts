import sqlQuery from '@comark/cms/plugins/sql-query'
import sqliteFullTextSearch from '@comark/cms/plugins/sqlite-full-text-search'
import sqlite from '@comark/cms/database/sqlite-node'
import type { CMSPlugin } from '@comark/cms'
import { v3Enabled } from './cms-plugins.shared'

export function v3ServerPlugins(enabled?: boolean): CMSPlugin<any>[] {
  if (!v3Enabled(enabled)) return []
  const database = sqlite()
  return [
    sqlQuery({ database }),
    sqliteFullTextSearch({ database }),
  ]
}
