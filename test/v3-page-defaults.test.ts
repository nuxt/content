import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('v3 page defaults', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/v3-page-defaults', import.meta.url)),
  })

  // v3 took `title`/`description` from a leading `h1` and the paragraph after it,
  // then defaulted `seo.title`/`seo.description` to them.
  it('derives title, description and seo like v3', async () => {
    const pages = await $fetch<Record<string, unknown>>('/api/pages')

    expect(pages['/']).toEqual({
      title: 'Home',
      description: 'Welcome to the home page.',
      seo: { title: 'Home', description: 'Welcome to the home page.' },
    })
    // Frontmatter wins, field by field.
    expect(pages['/about']).toEqual({
      title: 'About us',
      description: 'The about page.',
      seo: { title: 'About us', description: 'Custom SEO description.', image: '/about.png' },
    })
    // Only a leading `h1` is a title, and only the paragraph right after it a description.
    expect(pages['/no-heading']).toEqual({
      title: '',
      description: '',
      seo: { title: '', description: '' },
    })
  })
})
