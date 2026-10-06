import sqlQueryClient from 'comark-content/plugins/sql-query/client'
import sqliteFullTextSearchClient from 'comark-content/plugins/sqlite-full-text-search/client'
import type { ContentClientPlugin } from 'comark-content/client'
import { v3Enabled } from './cms-plugins.shared'

export function v3ClientPlugins(enabled?: boolean): ContentClientPlugin<any>[] {
  if (!v3Enabled(enabled)) return []
  return [
    sqlQueryClient(),
    sqliteFullTextSearchClient(),
  ]
}
