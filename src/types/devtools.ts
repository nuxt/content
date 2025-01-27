/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Nuxt } from 'nuxt/schema'
import type { WebSocketServer } from 'vite'
import type { ModuleOptions } from '../module'

export interface ServerFunctions {
  getOptions(): ModuleOptions

  // start
  sqliteTables(): Promise<{ name: string }[] | undefined>
  sqliteTable(table: string): Promise<any[]>
  sqliteTableCreate(table: string): Promise<string>
  sqliteTableDrop(table: string): Promise<string>
  // end

  reset(): void
}

export interface ClientFunctions {
}

export interface DevtoolsServerContext {
  nuxt: Nuxt
  options: ModuleOptions
  wsServer: Promise<WebSocketServer>
}
