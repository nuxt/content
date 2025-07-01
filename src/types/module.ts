import type { ListenOptions } from 'listhen'
import type { LanguageRegistration, BuiltinLanguage as ShikiLang, BuiltinTheme as ShikiTheme, ThemeRegistrationAny, ThemeRegistrationRaw } from 'shiki'
import type { GitInfo } from '../utils/git'
import type { MarkdownPlugin } from './content'
import type { PathMetaOptions } from './path-meta'

export interface D1DatabaseConfig {
  type: 'd1'
  bindingName: string
  /**
   * @deprecated Use `bindingName` instead
   */
  binding?: string
}

export interface SqliteDatabaseConfig {
  type: 'sqlite'
  filename: string
}

export type PostgreSQLDatabaseConfig = {
  type: 'postgres'
  url: string
}

export type LibSQLDatabaseConfig = {
  type: 'libsql'
  /**
   * The URL of the libSQL/Turso database
   */
  url: string
  /**
   * The authentication token for the libSQL/Turso database
   */
  authToken: string
}

export interface PreviewOptions {
  /**
   * Enable preview in production by setting API URL
   */
  api?: string
  /**
   * Enable preview mode in development
   */
  dev?: boolean
  /**
   * Override Git information for preview validation
   */
  gitInfo?: GitInfo
}

export interface ModuleOptions {
  /**
   * @private
   * @default { type: 'sqlite', filename: '.data/content/local.db' }
   */
  _localDatabase: SqliteDatabaseConfig | D1DatabaseConfig
  /**
   * Production database configuration
   * @default { type: 'sqlite', filename: './contents.sqlite' }
   */
  database: D1DatabaseConfig | SqliteDatabaseConfig | PostgreSQLDatabaseConfig | LibSQLDatabaseConfig
  /**
   * Preview mode configuration
   * @default {}
   */
  preview?: PreviewOptions
  /**
   * Development HMR
   * @default { enabled: true }
   */
  watch?: Partial<ListenOptions> & { enabled?: boolean }

  renderer: {
    /**
     * Tags will be used to replace markdown components and render custom components instead of default ones.
     *
     * @default {}
     */
    alias?: Record<string, string>
    /**
     * Anchor link generation config
     *
     * @default {}
     */
    anchorLinks?: boolean | Partial<Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', boolean>>
  }

  build: {
    /**
     * List of user-defined transformers.
     */
    transformers?: string[]
    markdown?: {
      /**
       * Control behavior of Table of Contents generation
       */
      toc?: {
        /**
         * Maximum heading depth that includes in the table of contents.
         *
         * @default 2
         */
        depth?: number
        /**
         * Maximum depth of nested tags to search for heading.
         *
         * @default 2
         */
        searchDepth?: number
      }
      /**
       * By default, Nuxt Content extracts content from the first H1 heading and paragraphs below it.
       * And uses this title and paragraph as default value for the `title` and `description` fields.
       *
       * Setting this option to `false` will disable this behavior.
       *
       * @default true
       */
      contentHeading?: boolean
      /**
       * Register custom remark plugin to provide new feature into your markdown contents.
       * Checkout: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
       *
       * @default []
       */
      remarkPlugins?: Record<string, false | MarkdownPlugin>
      /**
       * Register custom remark plugin to provide new feature into your markdown contents.
       * Checkout: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md
       *
       * @default []
       */
      rehypePlugins?: Record<string, false | MarkdownPlugin>

      /**
       * Content module uses `shiki` to highlight code blocks.
       * You can configure Shiki options to control its behavior.
       */
      highlight?: false | {
        /**
         * Default theme that will be used for highlighting code blocks.
         */
        theme?: ShikiTheme | {
          default: ShikiTheme | ThemeRegistrationRaw | string
          [theme: string]: ShikiTheme | ThemeRegistrationRaw | string
        }

        /**
         * Preloaded languages that will be available for highlighting code blocks.
         *
         * @deprecated Use `langs` instead
         */
        preload?: (ShikiLang | LanguageRegistration)[]

        /**
         * Languages to be bundled loaded by Shiki
         *
         * All languages used has to be included in this list at build time, to create granular bundles.
         *
         * Unlike the `preload` option, when this option is provided, it will override the default languages.
         *
         * @default ['js','jsx','json','ts','tsx','vue','css','html','vue','bash','md','mdc','yaml']
         */
        langs?: (ShikiLang | LanguageRegistration)[]

        /**
         * Additional themes to be bundled loaded by Shiki.
         */
        themes?: (ShikiTheme | ThemeRegistrationAny)[]
      }
    }
    pathMeta?: PathMetaOptions
    /**
     * Options for yaml parser.
     *
     * @default {}
     */
    yaml?: false | Record<string, unknown>
    /**
     * Options for csv parser.
     *
     * @default {}
     */
    csv?: false | {
      json?: boolean
      delimiter?: string
    }
  }

  experimental?: {
    /**
     * Use Node.js native SQLite bindings instead of `better-sqlite3` if available
     * Node.js SQLite introduced in v22.5.0
     *
     * @default false
     * @deprecated Use `sqliteConnector: 'native'` instead
     */
    nativeSqlite?: boolean

    /**
     * Use given SQLite connector instead of `better-sqlite3` if available
     *
     * @default undefined
     */
    sqliteConnector?: SQLiteConnector
  }
}

export interface RuntimeConfig {
  content: {
    version: string
    databaseVersion: string
    database: D1DatabaseConfig | SqliteDatabaseConfig | PostgreSQLDatabaseConfig
    localDatabase: SqliteDatabaseConfig
    integrityCheck: boolean
  }
}

export interface PublicRuntimeConfig {
  preview: {
    api?: string
    iframeMessagingAllowedOrigins?: string
  }
}

export type SQLiteConnector = 'native' | 'sqlite3' | 'better-sqlite3'
