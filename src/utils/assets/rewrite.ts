import { dirname, resolve } from 'pathe'
import { visit } from 'minimark'
import type { MinimarkElement, MinimarkNode, MinimarkTree } from 'minimark'
import type { FileAfterParseHook } from '../../types'
import { buildQuery, buildStyle, isRelativeAsset, parseQuery, removeOrdering, removeQuery } from './paths'
import type { AssetIndex, AssetIndexEntry, ImageSizeHint, UnresolvedIndex } from './shared'

interface RewriteContext {
  index: AssetIndex
  unresolved: UnresolvedIndex | null
  fileDir: string
  id: string
  path: string
  collection: string
  imageSizes: ImageSizeHint[]
  blankLinks: boolean
}

export interface AfterParseHandlerOptions {
  imageSizes: ImageSizeHint[]
  blankLinks: boolean
  unresolved?: UnresolvedIndex
}

// Top-level fields that are structural or already resolved. Everything else is
// walked for relative asset references (`isRelativeAsset` filters non-assets).
const SKIP_TOP_LEVEL = new Set(['id', 'body', 'meta', '__metadata', 'stem', 'extension', 'path', 'rawbody'])

function resolvedAssetKey(fileDir: string, value: string): string {
  return removeOrdering(resolve(fileDir, removeQuery(value)))
}

function resolveAssetFromContent(index: AssetIndex, fileDir: string, value: string): AssetIndexEntry | undefined {
  return index.get(resolvedAssetKey(fileDir, value))
}

function registerContent(entry: AssetIndexEntry, ctx: RewriteContext): void {
  if (ctx.id && !entry.content.some(reference => reference.id === ctx.id)) {
    entry.content.push({ id: ctx.id, path: ctx.path, collection: ctx.collection })
  }
}

// Record a reference whose target doesn't exist yet, so dev HMR can re-parse once it appears.
function recordUnresolved(ctx: RewriteContext, value: string): void {
  if (!ctx.unresolved) {
    return
  }
  const key = resolvedAssetKey(ctx.fileDir, value)
  const list = ctx.unresolved.get(key)
  if (!list) {
    ctx.unresolved.set(key, [{ id: ctx.id, path: ctx.path, collection: ctx.collection }])
  }
  else if (!list.some(reference => reference.id === ctx.id)) {
    list.push({ id: ctx.id, path: ctx.path, collection: ctx.collection })
  }
}

function applyImageSize(props: Record<string, unknown>, entry: AssetIndexEntry, imageSizes: ImageSizeHint[]): void {
  const { width, height } = entry
  if (!width || !height) {
    return
  }
  if (imageSizes.includes('attrs')) {
    props.width = width
    props.height = height
  }
  if (imageSizes.includes('style')) {
    const ratio = `${width}/${height}`
    if (typeof props.style === 'string') {
      props.style = buildStyle(props.style, `aspect-ratio: ${ratio}`)
    }
    else if (props.style && typeof props.style === 'object') {
      (props.style as Record<string, unknown>).aspectRatio = ratio
    }
    else {
      props.style = `aspect-ratio: ${ratio};`
    }
  }
}

function rewriteBody(body: MinimarkTree, ctx: RewriteContext): void {
  visit(body, (node: MinimarkNode) => Array.isArray(node), (node: MinimarkNode) => {
    const [tag, props] = node as MinimarkElement
    if (!props || typeof props !== 'object') {
      return undefined
    }
    for (const [key, value] of Object.entries(props)) {
      // `:prop` are MDC dynamic bindings (expressions), not literal paths.
      if (key.startsWith(':') || typeof value !== 'string' || !isRelativeAsset(value)) {
        continue
      }
      const entry = resolveAssetFromContent(ctx.index, ctx.fileDir, value)
      if (!entry) {
        recordUnresolved(ctx, value)
        continue
      }
      registerContent(entry, ctx)
      props[key] = entry.publicSrc + parseQuery(value)

      if (tag === 'img' || tag === 'nuxt-img') {
        applyImageSize(props, entry, ctx.imageSizes)
      }
      else if (tag === 'a' && ctx.blankLinks) {
        props.target ??= '_blank'
      }
    }
    return undefined
  })
}

function walkValue(value: unknown, rewriteLeaf: (value: string) => string): unknown {
  if (typeof value === 'string') {
    return rewriteLeaf(value)
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = walkValue(value[i], rewriteLeaf)
    }
    return value
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of Object.keys(record)) {
      record[key] = walkValue(record[key], rewriteLeaf)
    }
  }
  return value
}

function rewriteMeta(content: Record<string, unknown>, ctx: RewriteContext): void {
  const rewriteLeaf = (value: string): string => {
    if (!isRelativeAsset(value)) {
      return value
    }
    const entry = resolveAssetFromContent(ctx.index, ctx.fileDir, value)
    if (!entry) {
      recordUnresolved(ctx, value)
      return value
    }
    registerContent(entry, ctx)
    if (entry.width && entry.height && (ctx.imageSizes.includes('src') || ctx.imageSizes.includes('url'))) {
      return buildQuery(entry.publicSrc, parseQuery(value), `width=${entry.width}&height=${entry.height}`)
    }
    return entry.publicSrc + parseQuery(value)
  }

  if (content.meta && typeof content.meta === 'object') {
    walkValue(content.meta, rewriteLeaf)
  }
  for (const key of Object.keys(content)) {
    if (!SKIP_TOP_LEVEL.has(key)) {
      content[key] = walkValue(content[key], rewriteLeaf)
    }
  }
}

export function createAfterParseHandler(index: AssetIndex, options: AfterParseHandlerOptions) {
  return (ctx: FileAfterParseHook): void => {
    const fileDir = ctx.file.dirname || (ctx.file.path ? dirname(ctx.file.path) : '')
    if (!fileDir) {
      return
    }
    const content = ctx.content as unknown as Record<string, unknown>
    const rewriteCtx: RewriteContext = {
      index,
      unresolved: options.unresolved || null,
      fileDir,
      id: String(content.id ?? ''),
      path: ctx.file.path || '',
      collection: ctx.collection?.name || '',
      imageSizes: options.imageSizes,
      blankLinks: options.blankLinks,
    }

    const body = content.body
    if (body && typeof body === 'object' && Array.isArray((body as MinimarkTree).value)) {
      rewriteBody(body as MinimarkTree, rewriteCtx)
    }
    rewriteMeta(content, rewriteCtx)
  }
}
