import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
import fsSource from '@comark/cms/sources/fs'
import githubSource from '@comark/cms/sources/github'
import mergeSources from '@comark/cms/sources/merge'
import type { Source, JsonSchema } from '@comark/cms'

/**
 * Read a Nuxt Content v3 `content.config.ts` and translate its collections into
 * Comark CMS sources.
 *
 * v3 configs declare collections with `defineContentConfig`/`defineCollection`
 * and describe where documents live through each collection's `source` (a glob
 * string, a `{ include, exclude, prefix, cwd, repository }` object, or an array
 * of those). This maps every descriptor onto a Comark `Source` built from the
 * `fs`/`github` source factories; a collection that declares several descriptors
 * is combined into one via the `merge` source, so the result is keyed by
 * collection name and can be handed straight to `createCMS({ sources })`.
 *
 * Each source carries the descriptor's `prefix` and a `schema` derived from the
 * collection's `z` schema (as Comark's minimal JSON Schema). `page` collections
 * also gain v3's default meta fields (`title`, `description`, `seo`,
 * `navigation`). Because that conversion is approximate, sources are created with
 * `schemaValidation: false` — the schema still drives generated types and query
 * columns, but does not filter documents at load. A collection with several
 * descriptors is combined with the `merge` source, which takes the collection
 * schema and the first descriptor's prefix.
 *
 * A relative `configPath` is resolved against `options.cwd`, which may be a
 * directory path or a `file://` URL (e.g. `import.meta.url`); the project root
 * used for the default content directory is derived from the resolved config
 * location. Defaults to `process.cwd()`.
 *
 * Only this function is exported; the config is evaluated through a private
 * `@nuxt/content` shim so the file's `defineContentConfig`/`z` imports resolve
 * without pulling in (or re-exposing) the v3 package.
 */
export function readContentConfigSources(
  configPath: string,
  options: { cwd?: string | URL } = {},
): Record<string, Source> {
  const absConfigPath = resolveConfigPath(configPath, options.cwd)
  const rootDir = dirname(absConfigPath)
  const config = importContentConfig(rootDir, absConfigPath)

  const sources: Record<string, Source> = {}
  for (const [name, collection] of Object.entries(config.collections ?? {})) {
    const descriptors = normalizeSource(collection.source)
    if (!descriptors.length) {
      continue
    }
    const userSchema = toComarkSchema(collection.schema)
    // `page` collections gain v3's default meta fields (title/description/…);
    // `data` collections keep only their own schema.
    const schema = collection.type === 'page' ? withPageDefaults(userSchema) : userSchema

    // A collection maps to a single named source; multiple v3 descriptors are
    // merged into one so they stay queryable under the collection name.
    if (descriptors.length === 1) {
      sources[name] = toSource(descriptors[0]!, rootDir, schema)
      continue
    }
    const children = descriptors.map(descriptor => toSource(descriptor, rootDir))
    const merged = mergeSources(children, { errorOnConflict: true, ...(schema ? { schema, schemaValidation: false } : {}) })
    // `merge` carries no prefix of its own; adopt the first descriptor's.
    const prefix = descriptors.map(descriptor => descriptor.prefix).find(Boolean)
    sources[name] = prefix ? { ...merged, prefix } : merged
  }
  return sources
}

/** Shape of a v3 collection `source` descriptor, once normalized to an object. */
interface SourceDescriptor {
  include: string
  exclude?: string[]
  prefix?: string
  cwd?: string
  repository?: string
}

interface ContentCollection {
  type?: 'page' | 'data'
  source?: string | SourceDescriptor | Array<string | SourceDescriptor>
  schema?: unknown
}

interface ContentConfig {
  collections?: Record<string, ContentCollection>
}

function normalizeSource(source: ContentCollection['source']): SourceDescriptor[] {
  if (!source) {
    return []
  }
  const list = Array.isArray(source) ? source : [source]
  return list.map(entry => (typeof entry === 'string' ? { include: entry } : entry))
}

/**
 * Resolve `configPath` to an absolute filesystem path. Mirrors the `cwd`
 * handling of Comark's `fs` source: a `URL`/`file://` `cwd` (such as
 * `import.meta.url`) resolves the path file-relative, otherwise it resolves
 * against the `cwd` directory (or `process.cwd()`).
 */
function resolveConfigPath(configPath: string, cwd?: string | URL): string {
  if (configPath.startsWith('file://')) {
    return fileURLToPath(configPath)
  }
  if (isAbsolute(configPath)) {
    return configPath
  }
  if (cwd instanceof URL || (typeof cwd === 'string' && cwd.startsWith('file://'))) {
    return fileURLToPath(new URL(configPath, cwd))
  }
  return resolve(cwd ?? process.cwd(), configPath)
}

function toSource(descriptor: SourceDescriptor, rootDir: string, schema?: JsonSchema): Source {
  const base = splitGlob(descriptor.include)
  const rebasedExclude = rebaseExclude(descriptor.exclude, base)
  // Our zod → JSON Schema conversion is approximate, so keep it for types/query
  // columns but leave document validation off (see `readContentConfigSources`).
  const schemaOptions = schema ? { schema, schemaValidation: false } : {}

  if (descriptor.repository) {
    const { repo, branch, dir } = parseRepository(descriptor.repository)
    return githubSource({
      repo,
      ...(branch ? { branch } : {}),
      dir: [dir, base].filter(Boolean).join('/'),
      prefix: descriptor.prefix,
      exclude: rebasedExclude,
      ...schemaOptions,
    })
  }

  // Local source: resolve against the collection's `cwd`, falling back to the
  // v3 default content directory (`<rootDir>/content`).
  const cwd = descriptor.cwd
    ? (isAbsolute(descriptor.cwd) ? descriptor.cwd : resolve(rootDir, descriptor.cwd))
    : join(rootDir, 'content')

  return fsSource(resolve(cwd, base), {
    prefix: descriptor.prefix,
    exclude: rebasedExclude,
    ...schemaOptions,
  })
}

const GLOB_CHARS = /[*?{}[\]()!]/

/**
 * Split an `include` glob into its static directory (used as the source base)
 * and the remaining glob. `docs/**\/*` → base `docs`; `index.yml` → base
 * `index.yml` (a single-file source, which the `fs` factory detects on its own).
 *
 * The base scopes the source to a directory; the glob remainder is dropped, so
 * Comark reads everything under it recursively (a shallow `dir/*` behaves like
 * `dir/**`). `exclude` and Comark's per-extension parsers narrow it from there.
 */
function splitGlob(pattern: string): string {
  const segments = pattern.split('/')
  const staticSegments: string[] = []
  for (const segment of segments) {
    if (GLOB_CHARS.test(segment)) {
      break
    }
    staticSegments.push(segment)
  }
  return staticSegments.join('/')
}

/** Rewrite v3 excludes (relative to the include root) to be relative to `base`. */
function rebaseExclude(exclude: string[] | undefined, base: string): string[] | undefined {
  if (!exclude?.length) {
    return undefined
  }
  if (!base) {
    return exclude
  }
  const stripPrefix = `${base}/`
  return exclude.map(pattern => (pattern.startsWith(stripPrefix) ? pattern.slice(stripPrefix.length) : pattern))
}

/** Parse a `github.com/<owner>/<repo>[/tree/<branch>[/<dir>]]` URL. */
function parseRepository(url: string): { repo: string, branch?: string, dir: string } {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+)(?:\/(.+))?)?\/?$/)
  if (!match) {
    throw new Error(`Unsupported content source repository: ${url}`)
  }
  const [, owner, name, branch, dir] = match
  return { repo: `${owner}/${name}`, branch, dir: dir ?? '' }
}

/**
 * Evaluate the v3 config through jiti. `@nuxt/content` is stubbed with a private
 * shim (installed on `globalThis` for the duration of the load) so the file's
 * `defineContentConfig`/`defineCollection`/`z` imports resolve without pulling
 * in the v3 package. `z` records enough of each schema to convert it later.
 */
function importContentConfig(rootDir: string, configPath: string): ContentConfig {
  const inner = createJiti(import.meta.url)
  const jiti = createJiti(import.meta.url, {
    tryNative: false,
    moduleCache: false,
    fsCache: false,
    transform: (opts) => {
      const code = stubContentImports(opts.source).replace(/import\.meta\.rootDir/g, JSON.stringify(rootDir))
      return { code: inner.transform({ ...opts, source: code }) }
    },
  })

  const globals = globalThis as { [SHIM_KEY]?: unknown }
  const previous = globals[SHIM_KEY]
  globals[SHIM_KEY] = createContentShim()
  try {
    // The callable (CommonJS-style) form loads synchronously, unlike `jiti.import`.
    const mod = jiti(configPath) as { default: ContentConfig }
    return mod.default
  }
  finally {
    // Restore whatever was there (`undefined` when nothing) — no nested load relies on it.
    globals[SHIM_KEY] = previous
  }
}

const SHIM_KEY = '__nuxtContentShim' as const

/** Rewrite `import { … } from '@nuxt/content'` to read from the global shim. */
function stubContentImports(source: string): string {
  return source.replace(
    /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@nuxt\/content['"];?/g,
    (_match, names: string) => {
      const identifiers = names
        .split(',')
        .map(part => part.trim().split(/\s+as\s+/).pop()!.trim())
        .filter(Boolean)
      return `const { ${identifiers.join(', ')} } = globalThis.${SHIM_KEY};`
    },
  )
}

/**
 * The stand-in for `@nuxt/content`: `defineContentConfig`/`defineCollection` are
 * identity functions, `z` is a recording builder (see {@link zShim}). Any other
 * named export falls back to the `z` builder so unknown imports don't crash.
 */
function createContentShim() {
  const identity = <T>(value: T): T => value
  const known: Record<string, unknown> = { defineContentConfig: identity, defineCollection: identity, z: zShim }
  return new Proxy(known, { get: (target, key) => (key in target ? target[key as string] : zShim) })
}

// --- Minimal zod-compatible recording builder -------------------------------
// Only the shape needed to produce Comark's minimal JSON Schema is captured;
// refinements like `.url()`/`.editor()`/`.min()` are accepted and ignored.

interface ZNode {
  __zkind: string
  __zargs: unknown[]
  __zoptional?: boolean
  __zextend?: Record<string, unknown>
  __zpick?: string[]
  __zomit?: string[]
}

function wrapZ(data: ZNode): ZNode {
  return new Proxy(data, {
    get(target, key) {
      if (typeof key !== 'string' || key.startsWith('__z')) {
        return target[key as keyof ZNode]
      }
      // Every other access is a chained method returning a fresh (cloned) node,
      // so shared base schemas (e.g. `const Base = z.object(...)`) aren't mutated.
      return (...args: unknown[]): ZNode => {
        const next: ZNode = { ...target }
        switch (key) {
          case 'optional':
          case 'nullish':
          case 'nullable':
          case 'default':
            next.__zoptional = true
            break
          case 'extend':
            next.__zextend = { ...(target.__zextend ?? {}), ...(args[0] as Record<string, unknown> ?? {}) }
            break
          case 'pick':
            next.__zpick = Object.keys((args[0] as Record<string, unknown>) ?? {})
            break
          case 'omit':
            next.__zomit = Object.keys((args[0] as Record<string, unknown>) ?? {})
            break
          // default: a refinement/format helper (`.url()`, `.editor()`, …) with
          // no effect on the minimal schema — return the clone unchanged.
        }
        return wrapZ(next)
      }
    },
  })
}

const zShim = new Proxy({} as Record<string, (...args: unknown[]) => ZNode>, {
  get: (_target, key) =>
    typeof key === 'string'
      ? (...args: unknown[]) => wrapZ({ __zkind: key, __zargs: args })
      : undefined,
})

function isZNode(value: unknown): value is ZNode {
  return !!value && typeof value === 'object' && '__zkind' in value
}

/**
 * Fields v3 injects into every `page` collection's schema. Rendered in Comark's
 * minimal JSON Schema (no `default`/`anyOf`/`additionalProperties`); `path` is
 * left out because Comark exposes it as a top-level column, not a `data` field.
 */
const PAGE_DEFAULT_PROPERTIES: Record<string, JsonSchema> = {
  title: { type: 'string' },
  description: { type: 'string' },
  seo: { type: 'object' },
  navigation: {
    type: ['boolean', 'object'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      icon: { type: 'string' },
    },
  },
}
const PAGE_DEFAULT_REQUIRED = ['title', 'description']

/** Merge the collection schema over the default `page` fields. */
function withPageDefaults(schema: JsonSchema | undefined): JsonSchema {
  return {
    type: 'object',
    properties: { ...PAGE_DEFAULT_PROPERTIES, ...(schema?.properties ?? {}) },
    required: [...new Set([...PAGE_DEFAULT_REQUIRED, ...(schema?.required ?? [])])],
  }
}

/** Convert a recorded `z` schema into Comark's minimal JSON Schema. */
function toComarkSchema(schema: unknown): JsonSchema | undefined {
  return isZNode(schema) ? resolveSchema(schema) : undefined
}

function resolveSchema(node: ZNode): JsonSchema {
  switch (node.__zkind) {
    case 'object':
      return objectSchema(node)
    case 'array':
      return { type: 'array', items: isZNode(node.__zargs[0]) ? resolveSchema(node.__zargs[0]) : {} }
    case 'number':
      return { type: 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'record':
      return { type: 'object' }
    case 'string':
    case 'enum':
    case 'literal':
      return { type: 'string' }
    default:
      // union/intersection/any/unknown/… — leave the type open.
      return {}
  }
}

function objectSchema(node: ZNode): JsonSchema {
  let shape: Record<string, unknown> = { ...(node.__zargs[0] as Record<string, unknown> ?? {}), ...(node.__zextend ?? {}) }
  if (node.__zpick) {
    shape = Object.fromEntries(Object.entries(shape).filter(([key]) => node.__zpick!.includes(key)))
  }
  if (node.__zomit) {
    shape = Object.fromEntries(Object.entries(shape).filter(([key]) => !node.__zomit!.includes(key)))
  }

  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []
  for (const [key, child] of Object.entries(shape)) {
    if (!isZNode(child)) {
      continue
    }
    properties[key] = resolveSchema(child)
    if (!child.__zoptional) {
      required.push(key)
    }
  }

  const schema: JsonSchema = { type: 'object', properties }
  if (required.length) {
    schema.required = required
  }
  return schema
}
