export interface SlugifyOptions {
  /**
   * Characters to remove from the slug
   *
   * @default undefined
   */
  remove?: RegExp
  replacement?: string
  /**
   * Convert the slug to lowercase
   *
   * @default true
   */
  lower?: boolean
  strict?: boolean
  locale?: string
  trim?: boolean
}

export interface PathMetaOptions {
  /**
   * If set to `true`, the path will be prefixed with a leading slash.
   *
   * @default true
   */
  forceLeadingSlash?: boolean
  /**
   * Slugify options
   *
   * @see https://github.com/simov/slugify#options
   */
  slugifyOptions?: SlugifyOptions
}
