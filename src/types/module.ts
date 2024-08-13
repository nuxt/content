export interface ModuleOptions {
  database: 'nuxthub' | 'builtin'
  clientDB?: {
    enabled: boolean
  }
  dev?: {
    dataDir?: string
    databaseName?: string
  }
}
