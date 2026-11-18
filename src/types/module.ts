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
  type: 'postgresql' | 'postgres'
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
  authToken?: string
}

export type PGliteDatabaseConfig = {
  type: 'pglite'
  /**
   * Path to the PGlite data directory (optional, defaults to in-memory)
   */
  dataDir?: string
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
  database: D1DatabaseConfig | SqliteDatabaseConfig | PostgreSQLDatabaseConfig | LibSQLDatabaseConfig | PGliteDatabaseConfig
  /**
   * Prefix of every table the module creates in the database, collection tables and
   * the internal `info` table included (`<prefix><collection>`).
   *
   * Use a distinct prefix for each deployment that shares one database, such as preview
   * deployments of several branches bound to the same D1 database, so they don't overwrite
   * each other's content. Must only contain letters, digits and underscores.
   *
   * Table names are resolved at build time: change it in `nuxt.config`, not through a runtime env variable.
   * @default '_content_'
   */
  tablePrefix?: string
  /**
   * Drop the tables of other `tablePrefix` sharing the database once they have been unused for `maxAge`.
   *
   * Each deployment that enables it records when it was last used, and drops the tables of the
   * deployments that also enabled it and have been unused for longer than `maxAge`. A pruned
   * deployment that gets traffic again imports its content again. Deployments that don't enable
   * it are never pruned.
   *
   * Intended for preview deployments sharing one database, so the tables of merged or deleted
   * branches don't pile up.
   * @default false
   */
  pruneUnusedPrefixes?: boolean | {
    /**
     * Prune the prefixes unused for longer than this, in seconds
     * @default 604800 (7 days)
     */
    maxAge?: number
  }
  /**
   * Preview mode configuration
   * @default {}
   */
  preview?: PreviewOptions
  /**
   * Development HMR
   * @default { enabled: true }
   */
  watch?: { enabled?: boolean }
  /**
   * Integration with `nuxt-llms`: injects page collections into `llms.txt` and exposes the raw markdown endpoint when `nuxt-llms` is installed.
   * Set to `false` to disable it, for example when another module owns the raw markdown route.
   * @default true
   */
  llms?: boolean

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
     * - `better-sqlite3`: Default for Node.js environments
     * - `native`: Use Node.js built-in `node:sqlite` (requires Node.js >= 22.5.0)
     * - `sqlite3`: Use `sqlite3` package (works in StackBlitz/WebContainers)
     * - `bun`: Use Bun's built-in `bun:sqlite` (for Bun runtime targets, e.g. Vercel with bun1.x)
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
    database: D1DatabaseConfig | SqliteDatabaseConfig | PostgreSQLDatabaseConfig | PGliteDatabaseConfig | LibSQLDatabaseConfig
    localDatabase: SqliteDatabaseConfig | PGliteDatabaseConfig | LibSQLDatabaseConfig
    integrityCheck: boolean
    pruneUnusedPrefixes: false | { maxAge: number }
  }
}

export interface PublicRuntimeConfig {
  preview: {
    api?: string
    iframeMessagingAllowedOrigins?: string
  }
}

export type SQLiteConnector = 'native' | 'sqlite3' | 'better-sqlite3' | 'bun'
