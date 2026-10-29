/**
 * Nuxt Content v3 `content.build.markdown.toc` options.
 * @see https://content.nuxt.com/docs/getting-started/configuration#toc
 */
export interface TocOptions {
  /**
   * Maximum heading depth to include in the table of contents.
   * @default 2
   */
  depth?: number
  /**
   * Maximum depth of nested nodes to search for headings.
   * @default 2
   */
  searchDepth?: number
}

/** Serializable toc config exposed to the runtime as `import.meta.content.toc`. */
export type ResolvedTocOptions = Required<TocOptions>

/** Apply the defaults Nuxt Content v3 (through `@nuxtjs/mdc`) uses. */
export function resolveTocOptions(toc: TocOptions | undefined): ResolvedTocOptions {
  return {
    depth: toc?.depth ?? 2,
    searchDepth: toc?.searchDepth ?? 2,
  }
}
