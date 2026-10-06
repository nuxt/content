import sqlQuery from 'comark-content/plugins/sql-query'
import sqliteFullTextSearch from 'comark-content/plugins/sqlite-full-text-search'
import sqliteWasm from 'comark-content/database/sqlite-wasm'
import type { ContentPlugin } from 'comark-content'
import { v3Enabled } from './content-plugins.shared'

export function v3WasmPlugins(enabled?: boolean): ContentPlugin<any>[] {
  if (!v3Enabled(enabled)) return []
  const database = sqliteWasm()
  return [
    sqlQuery({ database }),
    sqliteFullTextSearch({ database }),
  ]
}
