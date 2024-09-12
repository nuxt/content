import type { Options as MiniSearchOptions } from 'minisearch'
import type { ListenOptions } from 'listhen'
import type { MarkdownPlugin, QueryBuilderParams, QueryBuilderWhere } from './content'
import type { BuiltinLanguage as ShikiLang, BuiltinTheme as ShikiTheme, LanguageRegistration, ThemeRegistrationAny } from 'shiki'

export type MountOptions = {
  driver: 'fs' | 'http' | string
  name?: string
  prefix?: string
  [options: string]: any
}

export interface ModuleOptions {
  /**
   * Base route that will be used for content api
   *
   * @default '_content'
   * @deprecated Use `api.base` instead
   */
  base: string
  api: {
    /**
     * Base route that will be used for content api
     *
     * @default '/api/_content'
     */
    baseURL: string
  }
  /**
   * Disable content watcher and hot content reload.
   * Note: Watcher is a development feature and will not includes in the production.
   *
   * @default true
   */
  watch: false | {
    ws: Partial<ListenOptions>
  }
  /**
   * Contents can be located in multiple places, in multiple directories or even in remote git repositories.
   * Using sources option you can tell Content module where to look for contents.
   *
   * @default ['content']
   */
  sources: Record<string, MountOptions> | Array<string | MountOptions>
  /**
   * List of ignore patterns that will be used to exclude content from parsing, rendering and watching.
   *
   * Note that files with a leading . or - are ignored by default
   *
   * @default []
   */
  ignores: Array<string>
  /**
   * Content module uses `remark` and `rehype` under the hood to compile markdown files.
   * You can modify this options to control its behavior.
   */
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
    },
    /**
     * Tags will be used to replace markdown components and render custom components instead of default ones.
     *
     * @default {}
     */
    tags?: Record<string, string>
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
    rehypePlugins?: Array<string | [string, MarkdownPlugin]> | Record<string, false | MarkdownPlugin>,
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
      depth?: number,
      /**
       * Excludes headings from link generation when they are in the depth range.
       *
       * @default [1]
       */
      exclude?: number[]
    }
  }
  /**
   * Content module uses `shiki` to highlight code blocks.
   * You can configure Shiki options to control its behavior.
   */
  highlight: false | {
    /**
     * Default theme that will be used for highlighting code blocks.
     */
    theme?: ShikiTheme | {
      default: ShikiTheme
      [theme: string]: ShikiTheme
    },

    /**
     * Preloaded languages that will be available for highlighting code blocks.
     *
     * @deprecated Use `langs` instead
     */
    preload?: (ShikiLang | LanguageRegistration)[],

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
  },
  /**
   * Options for yaml parser.
   *
   * @default {}
   */
  yaml: false | Record<string, any>
  /**
   * Options for yaml parser.
   *
   * @default {}
   */
  csv: false | {
    json?: boolean
    delimeter?: string
  }
  /**
   * Enable/Disable navigation.
   *
   * @default {}
   */
  navigation: false | {
    fields: Array<string>
  }
  /**
   * List of locale codes.
   * This codes will be used to detect contents locale.
   *
   * @default []
   */
  locales: Array<string>
  /**
   * Default locale for top level contents.
   *
   * @default undefined
   */
  defaultLocale?: string
  /**
   * Enable automatic usage of `useContentHead`
   *
   * @default true
   */
  contentHead?: boolean
  /**
   * Document-driven mode config
   *
   * @default false
   */
  documentDriven: boolean | {
    host?: string
    page?: boolean
    navigation?: boolean
    surround?: boolean
    globals?: {
      [key: string]: QueryBuilderParams
    }
    layoutFallbacks?: string[]
    injectPage?: boolean
    trailingSlash?: boolean
  },
  /**
   * Enable to keep uppercase characters in the generated routes.
   *
   * @default false
   */
  respectPathCase: boolean
  experimental: {
    clientDB?: boolean
    stripQueryParameters?: boolean
    advanceQuery?: boolean,

    /**
     * Control content cach generation.
     *
     * This option might be removed in the next major version.
     */
    cacheContents?: boolean
    /**
     * Search mode.
     *
     * @default undefined
     */
    search?: {
      /**
       * List of tags where text must not be extracted.
       *
       * By default, will extract text from each tag.
       *
       * @default ['script', 'style', 'pre']
       */
      ignoredTags?: Array<string>
      /**
       * Query used to filter contents that must be searched.
       * @default { _partial: false, _draft: false}
       */
      filterQuery?: QueryBuilderWhere
      /**
       * API return indexed contents to improve client-side load time.
       * This option will use MiniSearch to create the index.
       * If you disable this option, API will return raw contents instead
       * you can use with any client-side search.
       *
       * @default true
       */
      indexed?: boolean
      /**
       * MiniSearch Options. When using `indexed` option,
       * this options will be used to configure MiniSearch
       * in order to have the same options on both server and client side.
       *
       * @default
       * {
       *   fields: ['title', 'content', 'titles'],
       *   storeFields: ['title', 'content', 'titles'],
       *   searchOptions: {
       *     prefix: true,
       *     fuzzy: 0.2,
       *     boost: {
       *       title: 4,
       *       content: 2,
       *       titles: 1
       *     }
       *   }
       * }
       *
       * @see https://lucaong.github.io/minisearch/modules/_minisearch_.html#options
       */
      options?: MiniSearchOptions
    }
  }
}


export interface ContentContext extends ModuleOptions {
  base: Readonly<string>
  transformers: Array<string>
}
