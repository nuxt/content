import type { Nuxt } from '@nuxt/schema'
import { createResolver } from '@nuxt/kit'
import { beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineCollection } from '../../src/utils/collection'
import { loadContentConfig } from '../../src/utils/config'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

const rootDir = createResolver(import.meta.url).resolve('../fixtures/i18n')

const nuxtWithI18n = (options: Record<string, unknown>) => ({
  options: { dev: false, _installedModules: [], _layers: [{ config: { rootDir } }], ...options },
}) as unknown as Nuxt

describe('i18n collection config', () => {
  beforeAll(async () => {
    await initiateValidatorsContext()
  })

  it('adds a locale column and a (locale, stem) index', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'team/*.yml',
      schema: z.object({ name: z.string() }),
      indexes: [{ columns: ['name'] }],
      i18n: { locales: ['fr'], defaultLocale: 'en' },
    })

    expect(collection.fields.locale).toBe('string')
    expect(collection.indexes).toEqual([{ columns: ['name'] }, { columns: ['locale', 'stem'] }])
    expect(collection.i18n).toEqual({ locales: ['en', 'fr'], defaultLocale: 'en' })
  })

  it('keeps a user-declared (locale, stem) index instead of adding another one', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'team/*.yml',
      schema: z.object({ name: z.string() }),
      indexes: [{ columns: ['locale', 'stem'], name: 'by_locale' }],
      i18n: { locales: ['en'], defaultLocale: 'en' },
    })

    expect(collection.indexes).toEqual([{ columns: ['locale', 'stem'], name: 'by_locale' }])
  })

  it('resolves `i18n: true` from the @nuxtjs/i18n options', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({
      modules: ['@nuxtjs/i18n'],
      i18n: { locales: [{ code: 'fr' }, 'en'], defaultLocale: 'en' },
    }))
    const notes = collections.find(collection => collection.name === 'notes')!

    expect(notes.i18n).toEqual({ locales: ['fr', 'en'], defaultLocale: 'en' })
    expect(notes.fields.locale).toBe('string')
    expect(notes.indexes).toContainEqual({ columns: ['locale', 'stem'] })
  })

  it('resolves `i18n: true` from inline module options', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({
      modules: [['@nuxtjs/i18n', { locales: ['de'], defaultLocale: 'en' }]],
    }))

    expect(collections.find(collection => collection.name === 'notes')!.i18n).toEqual({ locales: ['en', 'de'], defaultLocale: 'en' })
  })

  it('disables `i18n: true` without @nuxtjs/i18n', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({ modules: [] }))
    const notes = collections.find(collection => collection.name === 'notes')!

    expect(notes.i18n).toBeUndefined()
    expect(notes.fields.locale).toBeUndefined()
  })
})
