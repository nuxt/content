import { dirname, isAbsolute, join, resolve } from 'node:path'
import { createJiti } from 'jiti'
import fsSource from '@comark/cms/sources/fs'
import githubSource from '@comark/cms/sources/github'
import mergeSources from '@comark/cms/sources/merge'
import type { Source } from '@comark/cms'

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
 * The `z` schemas are not converted — Comark infers each source's schema from
 * its content — so only the location/routing fields (`include`, `exclude`,
 * `prefix`, `cwd`, `repository`) carry over.
 *
 * Only this function is exported; the config is evaluated through a private
 * `@nuxt/content` shim so the file's `defineContentConfig`/`z` imports resolve
 * without pulling in (or re-exposing) the v3 package.
 */
export function readContentConfigSources(
  configPath: string,
  options: { rootDir?: string } = {},
): Record<string, Source> {
  const rootDir = options.rootDir ?? dirname(configPath)
  const config = importContentConfig(rootDir, configPath)

  const sources: Record<string, Source> = {}
  for (const [name, collection] of Object.entries(config.collections ?? {})) {
    const descriptors = normalizeSource(collection.source)
    if (!descriptors.length) {
      continue
    }
    const built = descriptors.map(descriptor => toSource(descriptor, rootDir))
    // A collection maps to a single named source; multiple v3 descriptors are
    // merged into one so they stay queryable under the collection name.
    sources[name] = built.length === 1 ? built[0]! : mergeSources(built, { errorOnConflict: true })
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

function toSource(descriptor: SourceDescriptor, rootDir: string): Source {
  const base = splitGlob(descriptor.include)
  const rebasedExclude = rebaseExclude(descriptor.exclude, base)

  if (descriptor.repository) {
    const { repo, branch, dir } = parseRepository(descriptor.repository)
    return githubSource({
      repo,
      ...(branch ? { branch } : {}),
      dir: [dir, base].filter(Boolean).join('/'),
      prefix: descriptor.prefix,
      exclude: rebasedExclude,
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
 * Evaluate the v3 config through jiti. `@nuxt/content` is stubbed inline so the
 * file's `defineContentConfig`/`defineCollection`/`z` imports resolve to no-op
 * builders — enough to read the exported collections without evaluating schemas.
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
  // The callable (CommonJS-style) form loads synchronously, unlike `jiti.import`.
  const mod = jiti(configPath) as { default: ContentConfig }
  return mod.default
}

const SHIM_PREAMBLE = 'const __ncProxy = new Proxy(function () {}, { get: () => __ncProxy, apply: () => __ncProxy });'
  + ' const __nuxtContentShim = new Proxy({}, { get: (_t, k) => (k === "defineContentConfig" || k === "defineCollection") ? (c) => c : __ncProxy });'

/** Replace `import { … } from '@nuxt/content'` with bindings to the inline shim. */
function stubContentImports(source: string): string {
  let stubbed = false
  const code = source.replace(
    /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@nuxt\/content['"];?/g,
    (_match, names: string) => {
      const identifiers = names
        .split(',')
        .map(part => part.trim().split(/\s+as\s+/).pop()!.trim())
        .filter(Boolean)
      stubbed = true
      return `const { ${identifiers.join(', ')} } = __nuxtContentShim;`
    },
  )
  return stubbed ? `${SHIM_PREAMBLE}\n${code}` : code
}
