import { describe, it, expect } from 'vitest'
import type { Component } from 'nuxt/schema'
import { collectContentComponents, componentsTemplate } from '../src/utils/components'

const component = (pascalName: string, filePath: string, options: Partial<Component> = {}) => ({
  pascalName,
  kebabName: pascalName,
  filePath,
  export: 'default',
  chunkName: pascalName,
  prefetch: false,
  preload: false,
  shortPath: filePath,
  ...options,
}) as Component

// Candidates for the tag `foo`, by source.
const global = (name: string) => component(name, `/app/node_modules/ui/${name}.vue`, { global: true })
const fromModule = (name: string) => component(name, `/app/node_modules/ui/${name}.vue`)
const project = (name: string) => component(name, `/app/components/${name}.vue`)
const content = (name: string) => component(`Content${name}`, `/app/components/content/${name}.vue`)

/**
 * The entry the template keeps for `foo`: `<tag>=<imported path>`, or `global` when a global
 * component wins, which is left out for `MarkdownDocument` to resolve from the app.
 */
function winner(candidates: Component[], srcDirs = ['/app']) {
  const template = componentsTemplate(candidates, srcDirs)
  const imports = Object.fromEntries([...template.matchAll(/^import (__component\d+) from "([^"]+)"$/gm)].map(m => [m[1], m[2]]))
  const entries = [...template.matchAll(/^ {2}"([\w-]+)": (.+),$/gm)].map(([, key, value]) =>
    `${key}=${value!.match(/import\("([^"]+)"\)/)?.[1] ?? imports[value!.match(/__wrap\((\w+)\)/)![1]!]}`)
  expect(entries.length, 'at most one entry per tag').toBeLessThanOrEqual(1)
  return entries[0] ?? 'global'
}

describe('componentsTemplate', () => {
  it('S1: picks a global `Foo` over module and project ones', () => {
    expect(winner([global('Foo'), fromModule('Foo'), project('Foo')])).toBe('global')
  })

  it('S2: picks `components/content` over every other source', () => {
    const others = [global('Foo'), global('ProseFoo'), fromModule('ProseFoo'), project('ProseFoo')]
    expect(winner([...others, content('Foo')])).toBe('foo=/app/components/content/Foo.vue')
    expect(winner([...others, content('ProseFoo')])).toBe('foo=/app/components/content/ProseFoo.vue')
  })

  it('S3: picks a project `ProseFoo` over a global `Foo` and module ones', () => {
    expect(winner([global('Foo'), fromModule('Foo'), fromModule('ProseFoo'), project('ProseFoo')]))
      .toBe('foo=/app/components/ProseFoo.vue')
  })

  it('S4: picks a global `ProseFoo` over project and module ones', () => {
    expect(winner([global('ProseFoo'), fromModule('Foo'), fromModule('ProseFoo'), project('Foo'), project('ProseFoo')]))
      .toBe('global')
  })

  it('S5: picks a module `ProseFoo` over a global `Foo`', () => {
    expect(winner([global('Foo'), fromModule('ProseFoo')])).toBe('foo=/app/node_modules/ui/ProseFoo.vue')
  })

  it('S6: picks a global `ProseFoo` over module ones', () => {
    expect(winner([global('ProseFoo'), fromModule('Foo'), fromModule('ProseFoo')])).toBe('global')
  })

  it('picks a `components/content` `ProseFoo` over its `Foo`', () => {
    expect(winner([content('Foo'), content('ProseFoo')])).toBe('foo=/app/components/content/ProseFoo.vue')
  })

  it('lazy-loads module components that aren\'t `Prose*`, below project ones', () => {
    expect(componentsTemplate([fromModule('Foo')], ['/app']))
      .toContain('  "foo": defineAsyncComponent(() => import("/app/node_modules/ui/Foo.vue")),')
    expect(winner([fromModule('Foo'), project('Foo')])).toBe('foo=/app/components/Foo.vue')
  })

  it('ranks components of a layer installed in `node_modules` as project ones', () => {
    const layer = '/app/node_modules/layer'
    const candidates = [
      component('Foo', `${layer}/node_modules/ui/Foo.vue`),
      component('Foo', `${layer}/components/Foo.vue`),
    ]
    expect(winner(candidates, ['/app', layer])).toBe(`foo=${layer}/components/Foo.vue`)
  })

  it('keeps `NuxtLink` as `A` unless another component renders links', () => {
    const nuxtLink = component('NuxtLink', '/app/node_modules/nuxt/nuxt-link.js', { export: 'default' })
    expect(winner([nuxtLink])).toBe('a=/app/node_modules/nuxt/nuxt-link.js')
    expect(winner([nuxtLink, global('ProseA')])).toBe('global')
  })

  it('imports `components/content` and `Prose*` components, and lazy-loads `*.lazy` and other project ones', () => {
    const template = componentsTemplate([
      component('ContentBundled', '/app/components/content/Bundled.vue'),
      component('ContentChunkedLazy', '/app/components/content/Chunked.lazy.vue'),
      project('ProseP'),
      project('Counter'),
    ], ['/app'])

    expect(template).toContain('import __component0 from "/app/components/content/Bundled.vue"')
    expect(template).toContain('import __component1 from "/app/components/ProseP.vue"')
    expect(template).toContain('  "bundled": __wrap(__component0),')
    expect(template).toContain('  "chunked": defineAsyncComponent(() => import("/app/components/content/Chunked.lazy.vue")),')
    expect(template).toContain('  "p": __wrap(__component1),')
    expect(template).toContain('  "counter": defineAsyncComponent(() => import("/app/components/Counter.vue")),')
  })

  it('keys entries by the tag as written in documents', () => {
    const template = componentsTemplate([
      component('ContentFooBar', '/app/components/content/foo/bar.vue'),
      project('MyCounter'),
    ], ['/app'])

    expect(template).toContain('  "foo-bar": __wrap(__component0),')
    expect(template).toContain('  "my-counter": defineAsyncComponent(() => import("/app/components/MyCounter.vue")),')
  })

  it('only adds the project and module components the documents use', () => {
    const template = componentsTemplate([
      project('Counter'),
      project('AdminPanel'),
      fromModule('ProseP'),
      fromModule('ProseTabs'),
      global('Icon'),
      content('Bundled'),
    ], ['/app'], new Set(['Counter', 'P', 'ProseP']))

    expect(template).toContain('  "counter": defineAsyncComponent(() => import("/app/components/Counter.vue")),')
    expect(template).toContain('"p": __wrap(__component')
    expect(template).not.toContain('AdminPanel')
    expect(template).not.toContain('ProseTabs')
    // Global components are resolved from the app; `components/content` ones are always kept.
    expect(template).not.toContain('Icon')
    expect(template).toContain('"bundled": __wrap(__component')
  })
})

describe('collectContentComponents', () => {
  it('collects the tags of every document, nested ones included', () => {
    const names = collectContentComponents([
      { nodes: [['p', {}, 'text', ['my-counter', { count: 1 }]]] },
      { nodes: [['alert-box', {}, ['template', { name: 'title' }, ['badge', {}]]]] },
      { nodes: undefined },
    ])

    expect([...names]).toEqual(expect.arrayContaining([
      'P', 'ProseP', 'MyCounter', 'ProseMyCounter', 'AlertBox', 'Template', 'Badge',
    ]))
    expect(names.has('Text')).toBe(false)
  })
})
