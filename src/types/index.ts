import './shim.d'

export * from './Markdown'
export * from './Database'
export * from './Navigation'
export * from './Document'
export * from './Context'

export interface DocusOptions {
  apiBase: string
  watch: boolean
  database: {
    provider: string
  }
}
