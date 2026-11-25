import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'

describe('app/content.ts', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/app-content', import.meta.url)), browser: true })

  it('server-renders through the server instance', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('The intro page.')
  })

  it('adds its plugins to every instance of the browser hub that `content` reads, over a layer\'s file', async () => {
    const page = await createPage('/')
    expect(JSON.parse(await page.locator('#probes').textContent() ?? '')).toEqual({ docs: ['project'], blog: ['project'] })
    await page.close()
  })
})
