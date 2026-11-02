import { join } from 'node:path'
import { pascalCase } from 'comark/utils'
import type { Component as NuxtComponent } from 'nuxt/schema'

const COMPONENT_FILE_RE = /\.(?:vue|ts)$/
const LAZY_COMPONENT_FILE_RE = /\.lazy\.(?:vue|ts)$/
const PROSE_RE = /^Prose(?=[A-Z])/
/** Tag name in documents -> Nuxt component name. */
const BUNDLED_BUILTIN_COMPONENTS: Record<string, string> = { A: 'NuxtLink' }

/**
 * Where a candidate comes from, highest priority first. For a tag `foo`, documents can resolve
 * to `ProseFoo` or `Foo`: `components/content` wins, then `ProseFoo` over `Foo`, then global
 * over project over module components.
 */
enum Rank {
  ContentProse,
  Content,
  GlobalProse,
  ProjectProse,
  ModuleProse,
  Global,
  Project,
  Builtin,
}

interface Candidate {
  /** Name the entry is keyed by (`ProseFoo` or `Foo`). */
  name: string
  rank: Rank
  component: NuxtComponent
  lazy: boolean
}

/**
 * `#build/content/components.mjs`: the components markdown tags (`::counter`) resolve against.
 * A tag `foo` can resolve to a component named `ProseFoo` or `Foo`. The ranking is done here
 * (see {@link Rank}): `components` only has the winner for each tag, keyed by the tag in
 * PascalCase (`Foo`), so the renderer looks it up once and never bundles a component that
 * can't be picked. Its value is:
 *
 * - for a global component, its name: it's already registered on the Vue app, so
 *   `ContentRenderer` resolves it from there.
 * - for `<layer srcDir>/components/content/**`, named by their path relative to that directory
 *   (`content/foo/bar.vue` is `FooBar`, used as `::foo-bar`), a static import, except
 *   `*.lazy.(vue|ts)` files, which become `async () => import()` loaders and are code-split.
 * - for `Prose*` components from the project or a module, a static import: they render the
 *   markdown elements of every document.
 * - for other project components (e.g. `components/Counter.vue`), a lazy loader, so they're
 *   only loaded by pages that use them, as in v3. Other module components are left out, as
 *   bundling all of them would pull in their optional peer deps.
 * - for built-ins such as `NuxtLink` (rendering `a`), a static import.
 *
 * @param components Components registered in the Nuxt app.
 * @param srcDirs Source directories of the Nuxt layers, highest priority first.
 * @param usedComponents Component names used by the documents (see {@link collectContentComponents}).
 *   When set, project and module components are only added if a document uses them, so the
 *   build doesn't compile every component of the app. Left unset in dev, where documents change live.
 */
export function componentsTemplate(components: NuxtComponent[], srcDirs: string[], usedComponents?: Set<string>) {
  const contentDirs = srcDirs.map(dir => join(dir, 'components/content/'))
  // Winner per tag, keyed by the name without the `Prose` prefix. Candidates of the same rank
  // keep the first one: a component can be registered twice (client and server) or by several layers.
  const winners = new Map<string, Candidate>()
  const consider = (candidate: Candidate) => {
    const key = candidate.name.replace(PROSE_RE, '')
    const current = winners.get(key)
    if (!current || candidate.rank < current.rank) winners.set(key, candidate)
  }

  for (const component of components) {
    if (component.island || !COMPONENT_FILE_RE.test(component.filePath)) continue
    const isProse = PROSE_RE.test(component.pascalName)

    const contentDir = contentDirs.find(dir => component.filePath.startsWith(dir))
    if (contentDir) {
      const relativePath = component.filePath.slice(contentDir.length)
      const lazy = LAZY_COMPONENT_FILE_RE.test(relativePath)
      const name = toComponentName(relativePath.replace(lazy ? LAZY_COMPONENT_FILE_RE : COMPONENT_FILE_RE, ''))
      if (name) consider({ name, rank: PROSE_RE.test(name) ? Rank.ContentProse : Rank.Content, component, lazy })
      continue
    }

    if (component.global) {
      consider({ name: component.pascalName, rank: isProse ? Rank.GlobalProse : Rank.Global, component, lazy: false })
      continue
    }

    // Project and module components are compiled once added: in a build, only add the used ones.
    if (usedComponents && !usedComponents.has(component.pascalName)) continue
    const isProject = !component.filePath.includes('/node_modules/')
      && srcDirs.some(dir => component.filePath.startsWith(withTrailingSlash(dir)))
    if (isProject) {
      consider({ name: component.pascalName, rank: isProse ? Rank.ProjectProse : Rank.Project, component, lazy: !isProse })
    }
    else if (isProse) {
      consider({ name: component.pascalName, rank: Rank.ModuleProse, component, lazy: false })
    }
  }

  // Nuxt registers built-ins outside `components/content`, so they're added explicitly.
  for (const [name, nuxtName] of Object.entries(BUNDLED_BUILTIN_COMPONENTS)) {
    const component = components.find(c => c.pascalName === nuxtName)
    if (component) consider({ name, rank: Rank.Builtin, component, lazy: false })
  }

  const imports: string[] = []
  const entries: string[] = []
  for (const [key, { name, rank, component, lazy }] of winners) {
    let value: string
    if (rank === Rank.GlobalProse || rank === Rank.Global) {
      // Registered on the Vue app by Nuxt: resolved from there by name.
      value = JSON.stringify(name)
    }
    else if (lazy) {
      const pick = component.export === 'default' ? '' : `.then(m => m[${JSON.stringify(component.export)}])`
      value = `async () => import(${JSON.stringify(component.filePath)})${pick}`
    }
    else {
      value = `__component${imports.length}`
      const path = JSON.stringify(component.filePath)
      imports.push(component.export === 'default'
        ? `import ${value} from ${path}`
        : `import { ${component.export} as ${value} } from ${path}`)
    }
    entries.push(`  ${JSON.stringify(key)}: ${value},`)
  }

  return [
    ...imports,
    '',
    'export const components = {',
    ...entries,
    '}',
    '',
  ].join('\n')
}

/**
 * Names of the components the documents' trees can resolve to: each element tag in
 * PascalCase and with the `Prose` prefix, the two names `ContentRenderer` looks up.
 *
 * @param documents Parsed documents (`nodes` of every file of the snapshot).
 */
export function collectContentComponents(documents: Iterable<{ nodes?: unknown }>): Set<string> {
  const names = new Set<string>()
  const visit = (node: unknown) => {
    // Elements are `[tag, props, ...children]`; text nodes are strings.
    if (!Array.isArray(node)) return
    const [tag, , ...children] = node
    if (typeof tag === 'string' && tag) {
      const name = pascalCase(tag)
      names.add(name)
      names.add(`Prose${name}`)
    }
    children.forEach(visit)
  }
  for (const document of documents) {
    if (Array.isArray(document.nodes)) document.nodes.forEach(visit)
  }
  return names
}

function withTrailingSlash(dir: string) {
  return dir.endsWith('/') ? dir : `${dir}/`
}

/**
 * `foo/bar-baz/index` -> `FooBarBaz`
 *
 * Names for `components/content/**` are built from the path inside that directory rather
 * than Nuxt's `pascalName`, which carries the directory prefix (`content/chunked.lazy.vue` is
 * `ContentChunkedLazy`). Stripping `Content`/`Lazy` from it isn't reliable: Nuxt drops a
 * repeated prefix (`content/ContentCard.vue` is `ContentCard`), and a directory's `prefix` or
 * `pathPrefix: false` option changes it altogether.
 */
function toComponentName(path: string): string {
  return path
    .split(/[/\\\-_.]+/)
    .filter((segment, index, segments) => segment && !(segment === 'index' && index === segments.length - 1 && index > 0))
    .map(segment => segment[0]!.toUpperCase() + segment.slice(1))
    .join('')
}
