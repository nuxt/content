import sqlQuery from '@comark/cms/plugins/sql-query'
import sqliteFullTextSearch from '@comark/cms/plugins/sqlite-full-text-search'
import sqliteWasm from '@comark/cms/database/sqlite-wasm'
import type { CMSPlugin } from '@comark/cms'
import { v3Enabled } from './cms-plugins.shared'

export function v3WasmPlugins(enabled?: boolean): CMSPlugin<any>[] {
  if (!v3Enabled(enabled)) return []
  const database = sqliteWasm()
  return [
    sqlQuery({ database }),
    sqliteFullTextSearch({ database }),
  ]
}
