import fs from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { setup, $fetch } from '@nuxt/test-utils'
import { afterAll, describe, expect, test } from 'vitest'

const resolver = createResolver(import.meta.url)

async function cleanup() {
  await fs.rm(resolver.resolve('./fixtures/remote-repository/node_modules'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/remote-repository/.nuxt'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/remote-repository/.data'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/remote-repository/content'), { recursive: true, force: true })
}

describe('remote-repository', async () => {
  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: resolver.resolve('./fixtures/remote-repository'),
    dev: true,
  })

  describe('Repository', () => {
    test('is cloned', async () => {
      const stat = await fs.stat(resolver.resolve('./fixtures/remote-repository/.data/content/github.com-nuxt-content-main'))
      expect(stat?.isDirectory()).toBe(true)
    })
  })

  describe('Content', () => {
    test('is loaded', async () => {
      const doc: Record<string, unknown> = await $fetch('/api/content/get?path=/docs/content')
      expect(doc).toBeDefined()
      expect(doc.path).toBe('/docs/content')
    })
  })
})
