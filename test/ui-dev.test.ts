import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { uiFixture } from './fixtures/ui-fixture'

// In dev every module component is in `#content-components`, lazy-loaded, as documents change live.
describe('nuxt ui in dev', async () => {
  await setup({ ...uiFixture(), dev: true })

  it('renders module and layer components used in a document', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<button [^>]*>.*?A Nuxt UI button.*?<\/button>/s)
    expect(html).not.toContain('<u-button')
    expect(html).toMatch(/<span class="layer-badge">.*?A layer badge.*?<\/span>/s)
  })
})
