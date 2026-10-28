import { describe, it, expect } from 'vitest'
import type { Component } from 'nuxt/schema'
import { componentsTemplate } from '../src/utils/components'

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

describe('componentsTemplate', () => {
  it('bundles `Prose*` components and leaves them out of `globalComponents`', () => {
    const template = componentsTemplate([
      component('ProseA', '/app/node_modules/@nuxt/ui/prose/A.vue', { global: true }),
      component('ProseP', '/app/components/ProseP.vue'),
      component('Icon', '/app/node_modules/@nuxt/icon/Icon.vue', { global: true }),
    ], ['/app'])

    expect(template).toContain('import __component0 from "/app/node_modules/@nuxt/ui/prose/A.vue"')
    expect(template).toContain('import __component1 from "/app/components/ProseP.vue"')
    expect(template).toContain('  "ProseA": __component0,')
    expect(template).toContain('  "ProseP": __component1,')
    expect(template).toContain('export const globalComponents = ["Icon"]')
  })

  it('prefers a `components/content` component over a `Prose*` one with the same name', () => {
    const template = componentsTemplate([
      component('ProseA', '/app/node_modules/@nuxt/ui/prose/A.vue', { global: true }),
      component('ProseA', '/app/components/content/ProseA.vue'),
    ], ['/app'])

    expect(template).toContain('import __component0 from "/app/components/content/ProseA.vue"')
    expect(template).not.toContain('@nuxt/ui')
    expect(template).toContain('export const globalComponents = []')
  })
})
