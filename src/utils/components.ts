import { join } from 'node:path'
import type { Component as NuxtComponent } from 'nuxt/schema'

const COMPONENT_FILE_RE = /\.(?:vue|ts)$/
const LAZY_COMPONENT_FILE_RE = /\.lazy\.(?:vue|ts)$/
/** Tag name in documents -> Nuxt component name. */
const BUNDLED_BUILTIN_COMPONENTS: Record<string, string> = { A: 'NuxtLink' }

/**
 * `#build/content/components.mjs`: the components markdown tags (`::counter`) resolve against.
 *
 * - `globalComponents`: names of global components. They're already registered on the
 *   Vue app, so `ContentRenderer` resolves them from there.
 * - `localComponents`: `<layer srcDir>/components/content/**`, keyed by their path relative
 *   to that directory (`content/foo/bar.vue` is `FooBar`, used as `::foo-bar`). Imported
 *   statically, except `*.lazy.(vue|ts)` files, which become `async () => import()` loaders
 *   and are code-split. Other project components are added as lazy loaders under their Nuxt
 *   name, and built-ins such as `NuxtLink` are keyed by the tag they render.
 *
 * @param components Components registered in the Nuxt app.
 * @param srcDirs Source directories of the Nuxt layers, highest priority first.
 */
export function componentsTemplate(components: NuxtComponent[], srcDirs: string[]) {
  const globalNames = [...new Set(components.filter(c => c.global).map(c => c.pascalName))]

  const contentDirs = srcDirs.map(dir => join(dir, 'components/content/'))
  const imports: string[] = []
  const entries: string[] = []
  // A component can be registered twice (client and server) or by several layers. Keep the first.
  const seen = new Set<string>()

  const addImport = (name: string, component: NuxtComponent) => {
    const id = `__component${imports.length}`
    const path = JSON.stringify(component.filePath)
    imports.push(component.export === 'default'
      ? `import ${id} from ${path}`
      : `import { ${component.export} as ${id} } from ${path}`)
    entries.push(`  ${JSON.stringify(name)}: ${id},`)
  }

  const addLoader = (name: string, component: NuxtComponent) => {
    const pick = component.export === 'default' ? '' : `.then(m => m[${JSON.stringify(component.export)}])`
    entries.push(`  ${JSON.stringify(name)}: async () => import(${JSON.stringify(component.filePath)})${pick},`)
  }

  for (const component of components) {
    if (!COMPONENT_FILE_RE.test(component.filePath)) continue
    const contentDir = contentDirs.find(dir => component.filePath.startsWith(dir))
    if (!contentDir) continue

    const relativePath = component.filePath.slice(contentDir.length)
    const isLazy = LAZY_COMPONENT_FILE_RE.test(relativePath)
    const name = toComponentName(relativePath.replace(isLazy ? LAZY_COMPONENT_FILE_RE : COMPONENT_FILE_RE, ''))
    if (!name || seen.has(name)) continue
    seen.add(name)

    if (isLazy) {
      addLoader(name, component)
    }
    else {
      addImport(name, component)
    }
  }

  // Other project components (e.g. `components/Counter.vue`) stay usable in documents, as in
  // v3: always lazy, so they're only loaded by pages that use them. Module-provided ones are
  // left out, as bundling all of them would pull in their optional peer deps.
  for (const component of components) {
    if (component.global || component.island || !COMPONENT_FILE_RE.test(component.filePath)) continue
    if (component.filePath.includes('/node_modules/')) continue
    if (!srcDirs.some(dir => component.filePath.startsWith(withTrailingSlash(dir)))) continue
    if (contentDirs.some(dir => component.filePath.startsWith(dir))) continue
    if (seen.has(component.pascalName)) continue
    seen.add(component.pascalName)
    addLoader(component.pascalName, component)
  }

  // Built-ins documents always need, bundled with the renderer and keyed by the tag they
  // render (`NuxtLink` as `A`, so markdown links use it). Nuxt registers them outside
  // `components/content`, so they're added explicitly; a local component with the same
  // name (e.g. `components/content/a.vue`) takes precedence.
  for (const [name, nuxtName] of Object.entries(BUNDLED_BUILTIN_COMPONENTS)) {
    const component = components.find(c => c.pascalName === nuxtName)
    if (!component || seen.has(name)) continue
    seen.add(name)
    addImport(name, component)
  }

  return [
    ...imports,
    '',
    `export const globalComponents = ${JSON.stringify(globalNames)}`,
    '',
    'export const localComponents = {',
    ...entries,
    '}',
    '',
  ].join('\n')
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
