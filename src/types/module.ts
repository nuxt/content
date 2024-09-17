export interface ModuleOptions {
  database: 'nuxthub' | 'builtin'
  dev: {
    dataDir: string
    databaseName: string
  }
}
