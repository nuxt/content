import type { BuiltinLanguage as ShikiLang, BuiltinTheme as ShikiTheme, LanguageRegistration, ThemeRegistrationAny } from 'shiki'
import type { MarkdownPlugin } from './content'

export interface D1DatabaseConfig {
  type: 'd1'
  binding: string
}

export interface SqliteDatabaseConfig {
  type: 'sqlite'
  filename: string
}

export interface ModuleOptions {
  /**
   * @private
   */
  _iv?: string
  /**
   * @private
   * @default { type: 'sqlite', filename: '.data/content/local.db' }
   */
  _localDatabase?: SqliteDatabaseConfig
  /**
   * Production database configuration
   */
  database: D1DatabaseConfig | SqliteDatabaseConfig
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
    anchorLinks?: boolean | {
      /**
       * Sets the maximal depth for anchor link generation
       *
       * @default 4
       */
      depth?: number
      /**
       * Excludes headings from link generation when they are in the depth range.
       *
       * @default [1]
       */
      exclude?: number[]
    }
  }
  build: {
    markdown: {
      /**
       * Whether MDC syntax should be supported or not.
       *
       * @default true
       */
      mdc?: boolean
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
       * Register custom remark plugin to provide new feature into your markdown contents.
       * Checkout: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
       *
       * @default []
       */
      remarkPlugins?: Array<string | [string, MarkdownPlugin]> | Record<string, false | MarkdownPlugin>
      /**
       * Register custom remark plugin to provide new feature into your markdown contents.
       * Checkout: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md
       *
       * @default []
       */
      rehypePlugins?: Array<string | [string, MarkdownPlugin]> | Record<string, false | MarkdownPlugin>

      /**
       * Content module uses `shiki` to highlight code blocks.
       * You can configure Shiki options to control its behavior.
       */
      highlight?: false | {
        /**
         * Default theme that will be used for highlighting code blocks.
         */
        theme?: ShikiTheme | {
          default: ShikiTheme
          [theme: string]: ShikiTheme
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
         * Additional themes to be bundled loaded by Shiki
         */
        themes?: (ShikiTheme | ThemeRegistrationAny)[]
      }
    }
    /**
     * Options for yaml parser.
     *
     * @default {}
     */
    yaml: false | Record<string, unknown>
    /**
     * Options for yaml parser.
     *
     * @default {}
     */
    csv: false | {
      json?: boolean
      delimeter?: string
    }
  }

}
