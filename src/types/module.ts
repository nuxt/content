export interface D1DatabaseConfig {
  type: 'd1'
  binding: string
}

export interface SqliteDatabaseConfig {
  type: 'sqlite'
  filename: string
}

export interface ModuleOptions {
  database: D1DatabaseConfig | SqliteDatabaseConfig
}
