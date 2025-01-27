import { useAsyncState } from './utils'
import { rpc } from './rpc'

export function useSqliteTables() {
  return useAsyncState('getSqliteTables', () => rpc.value.sqliteTables())
}

export function useSqliteTable(name: string) {
  return useAsyncState(`getSqliteTable:${name}`, () => rpc.value.sqliteTable(name))
}
