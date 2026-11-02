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

/** The single entry the template keeps for `foo`: `global:<name>` or the imported path. */
function winner(candidates: Component[]) {
  const template = componentsTemplate(candidates, ['/app'])
  const imports = Object.fromEntries([...template.matchAll(/^import (__component\d+) from "([^"]+)"$/gm)].map(m => [m[1], m[2]]))
  const entries = [...template.matchAll(/^ {2}"(\w+)": (.+),$/gm)].map(([, key, value]) => {
    if (value!.startsWith('"')) return `${key}=global:${JSON.parse(value!)}`
    return `${key}=${value!.match(/import\("([^"]+)"\)/)?.[1] ?? imports[value!]}`
  })
  expect(entries, 'one entry per tag').toHaveLength(1)
  return entries[0]
}

describe('componentsTemplate', () => {
  it('S1: picks a global `Foo` over module and project ones', () => {
    expect(winner([global('Foo'), fromModule('Foo'), project('Foo')])).toBe('Foo=global:Foo')
  })

  it('S2: picks `components/content` over every other source', () => {
    const others = [global('Foo'), global('ProseFoo'), fromModule('ProseFoo'), project('ProseFoo')]
    expect(winner([...others, content('Foo')])).toBe('Foo=/app/components/content/Foo.vue')
    expect(winner([...others, content('ProseFoo')])).toBe('Foo=/app/components/content/ProseFoo.vue')
  })

  it('S3: picks a project `ProseFoo` over a global `Foo` and module ones', () => {
    expect(winner([global('Foo'), fromModule('Foo'), fromModule('ProseFoo'), project('ProseFoo')]))
      .toBe('Foo=/app/components/ProseFoo.vue')
  })

  it('S4: picks a global `ProseFoo` over project and module ones', () => {
    expect(winner([global('ProseFoo'), fromModule('Foo'), fromModule('ProseFoo'), project('Foo'), project('ProseFoo')]))
      .toBe('Foo=global:ProseFoo')
  })

  it('S5: picks a module `ProseFoo` over a global `Foo`', () => {
    expect(winner([global('Foo'), fromModule('ProseFoo')])).toBe('Foo=/app/node_modules/ui/ProseFoo.vue')
  })

  it('S6: picks a global `ProseFoo` over module ones', () => {
    expect(winner([global('ProseFoo'), fromModule('Foo'), fromModule('ProseFoo')])).toBe('Foo=global:ProseFoo')
  })

  it('picks a `components/content` `ProseFoo` over its `Foo`', () => {
    expect(winner([content('Foo'), content('ProseFoo')])).toBe('Foo=/app/components/content/ProseFoo.vue')
  })

  it('leaves out module components that aren\'t `Prose*`', () => {
    expect(componentsTemplate([fromModule('Foo')], ['/app'])).not.toContain('Foo')
  })

  it('keeps `NuxtLink` as `A` unless another component renders links', () => {
    const nuxtLink = component('NuxtLink', '/app/node_modules/nuxt/nuxt-link.js', { export: 'default' })
    expect(winner([nuxtLink])).toBe('A=/app/node_modules/nuxt/nuxt-link.js')
    expect(winner([nuxtLink, global('ProseA')])).toBe('A=global:ProseA')
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
    expect(template).toContain('  "Bundled": __component0,')
    expect(template).toContain('  "Chunked": async () => import("/app/components/content/Chunked.lazy.vue"),')
    expect(template).toContain('  "P": __component1,')
    expect(template).toContain('  "Counter": async () => import("/app/components/Counter.vue"),')
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

    expect(template).toContain('  "Counter": async () => import("/app/components/Counter.vue"),')
    expect(template).toContain('"P": __component')
    expect(template).not.toContain('AdminPanel')
    expect(template).not.toContain('ProseTabs')
    // Global and `components/content` components are always kept.
    expect(template).toContain('  "Icon": "Icon",')
    expect(template).toContain('"Bundled": __component')
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
