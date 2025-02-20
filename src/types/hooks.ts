import type { ResolvedCollection } from './collection'
import type { ContentFile, ParsedContentFile } from './content'
import type { PathMetaOptions } from './path-meta'

// Parser options interface
interface ParserOptions {
  pathMeta: PathMetaOptions
  markdown: {
    compress: boolean
    rehypePlugins: Record<string, unknown>
    remarkPlugins: Record<string, unknown>
    [key: string]: unknown
  }
}

// Hook context for beforeParse
export interface FileBeforeParseHook {
  file: ContentFile
  collection: ResolvedCollection
  parserOptions: ParserOptions
}

// Hook context for afterParse
export interface FileAfterParseHook {
  file: ContentFile
  content: ParsedContentFile
  collection: ResolvedCollection
}

// Declare module to extend Nuxt hooks
declare module '@nuxt/schema' {
  interface NuxtHooks {
    'content:file:beforeParse': (ctx: FileBeforeParseHook) => Promise<void> | void
    'content:file:afterParse': (ctx: FileAfterParseHook) => Promise<void> | void
  }
}
