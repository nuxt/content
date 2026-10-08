import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { example } from './utils'

describe('i18n example', async () => {
  await setup(example('i18n'))

  it('serves the default locale from its own collection', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Welcome to Nuxt Content starter')
  })

  it('serves each prefixed locale from its own collection', async () => {
    const fr = await $fetch<string>('/fr')
    expect(fr).toContain('Bienvenue sur le starter Nuxt Content')

    const fa = await $fetch<string>('/fa')
    expect(fa).toContain('به استارتر Nuxt Content خوش آمدید')
    expect(fa).toContain('dir="rtl"')
  })
})
