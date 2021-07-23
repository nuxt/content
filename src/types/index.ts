export * from './Markdown'
export * from './Database'
export * from './Navigation'
export * from './Document'

export interface DocusOptions {
  apiBase: string
  watch: boolean
  database: {
    provider: string
  }

  _isSSG: boolean
  _dbPath: string
}
