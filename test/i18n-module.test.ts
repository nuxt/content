import fs from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { setup, $fetch } from '@nuxt/test-utils'
import { afterAll, describe, expect, test } from 'vitest'
import { getLocalDatabase } from '../src/utils/database'
import { getTableName } from '../src/utils/collection'
import { initiateValidatorsContext } from '../src/utils/dependencies'

const resolver = createResolver(import.meta.url)

async function cleanup() {
  await fs.rm(resolver.resolve('./fixtures/i18n-module/.nuxt'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/i18n-module/.data'), { recursive: true, force: true })
}

describe('i18n with @nuxtjs/i18n', async () => {
  await initiateValidatorsContext()

  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: resolver.resolve('./fixtures/i18n-module'),
    dev: true,
    port: 0,
  })

  test('`i18n: true` reads the locales of @nuxtjs/i18n', async () => {
    const db = await getLocalDatabase({ type: 'sqlite', filename: resolver.resolve('./fixtures/i18n-module/.data/content/contents.sqlite') }, { nativeSqlite: true })
    const columns = (await db.database?.prepare(`PRAGMA table_info(${getTableName('docs')});`).all() as { name: string }[]).map(c => c.name)
    const rows = await db.database?.prepare(`SELECT locale, stem FROM ${getTableName('docs')} ORDER BY stem, locale`).all()
    await db.close()

    expect(columns).toContain('locale')
    expect(rows).toEqual([
      { locale: 'en', stem: 'docs/hello' },
      { locale: 'fr', stem: 'docs/hello' },
      { locale: 'en', stem: 'docs/only-english' },
    ])
  })

  test('renders the content of the active locale during server-side rendering', async () => {
    expect(await $fetch<string>('/docs/hello')).toContain('English hello page.')
    expect(await $fetch<string>('/fr/docs/hello')).toContain('Page bonjour en français.')
  })

  test('falls back to the default locale for content without a translation', async () => {
    expect(await $fetch<string>('/fr/docs/only-english')).toContain('English only page.')
  })
})
