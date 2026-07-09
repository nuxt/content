import sqlQueryClient from '@comark/cms/plugins/sql-query.client'
import sqliteFullTextSearchClient from '@comark/cms/plugins/sqlite-full-text-search.client'
import type { CMSClientPlugin } from '@comark/cms/client'
import { v3Enabled } from './cms-plugins.shared'

export function v3ClientPlugins(enabled?: boolean): CMSClientPlugin<any>[] {
  if (!v3Enabled(enabled)) return []
  return [
    sqlQueryClient(),
    sqliteFullTextSearchClient(),
  ]
}
