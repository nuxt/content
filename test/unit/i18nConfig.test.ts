import type { Nuxt } from '@nuxt/schema'
import { createResolver } from '@nuxt/kit'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { defineCollection, resolveCollection } from '../../src/utils/collection'
import { loadContentConfig } from '../../src/utils/config'
import { initiateValidatorsContext } from '../../src/utils/dependencies'
import { logger } from '../../src/utils/dev'

const rootDir = createResolver(import.meta.url).resolve('../fixtures/i18n')

const nuxtWithI18n = (options: Record<string, unknown>) => ({
  options: { dev: false, _installedModules: [], _layers: [{ config: { rootDir } }], ...options },
}) as unknown as Nuxt

describe('i18n collection config', () => {
  beforeAll(async () => {
    await initiateValidatorsContext()
  })

  it('adds a locale column and a (stem, locale) index', () => {
    const collection = resolveCollection('team', defineCollection({
      type: 'data',
      source: 'team/*.yml',
      schema: z.object({ name: z.string() }),
      indexes: [{ columns: ['name'] }],
      i18n: { locales: ['fr'], defaultLocale: 'en' },
    }))!

    expect(collection.fields.locale).toBe('string')
    expect(collection.indexes).toEqual([{ columns: ['name'] }, { columns: ['stem', 'locale'] }])
    expect(collection.i18n).toEqual({ locales: ['en', 'fr'], defaultLocale: 'en' })
  })

  it('keeps a user-declared (stem, locale) index instead of adding another one', () => {
    const collection = resolveCollection('team', defineCollection({
      type: 'data',
      source: 'team/*.yml',
      schema: z.object({ name: z.string() }),
      indexes: [{ columns: ['stem', 'locale'], name: 'by_stem' }],
      i18n: { locales: ['en'], defaultLocale: 'en' },
    }))!

    expect(collection.indexes).toEqual([{ columns: ['stem', 'locale'], name: 'by_stem' }])
  })

  it('leaves the definition unchanged and names the collection in warnings', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const definition = defineCollection({
      type: 'data',
      source: 'team/*.yml',
      schema: z.object({ locale: z.number() }),
      i18n: { locales: ['fr'], defaultLocale: 'en' },
    })
    expect(definition.fields.locale).toBe('number')
    expect(definition.indexes).toBeUndefined()

    const collection = resolveCollection('team', definition)!
    const messages = warn.mock.calls.map(call => String(call[0]))
    warn.mockRestore()

    expect(collection.fields.locale).toBe('string')
    expect(messages).toHaveLength(2)
    for (const message of messages) {
      expect(message).toContain('"team"')
    }
  })

  it('resolves `i18n: true` from the @nuxtjs/i18n options', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({
      modules: ['@nuxtjs/i18n'],
      i18n: { locales: [{ code: 'fr' }, 'en'], defaultLocale: 'en' },
    }))
    const notes = collections.find(collection => collection.name === 'notes')!

    expect(notes.i18n).toEqual({ locales: ['fr', 'en'], defaultLocale: 'en' })
    expect(notes.fields.locale).toBe('string')
    expect(notes.indexes).toContainEqual({ columns: ['stem', 'locale'] })
  })

  it('resolves `i18n: true` from inline module options', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({
      modules: [['@nuxtjs/i18n', { locales: ['de'], defaultLocale: 'en' }]],
    }))

    expect(collections.find(collection => collection.name === 'notes')!.i18n).toEqual({ locales: ['en', 'de'], defaultLocale: 'en' })
  })

  it('merges inline @nuxtjs/i18n options with the `i18n` key like @nuxt/kit', async () => {
    const notesI18n = async (options: Record<string, unknown>) => (await loadContentConfig(nuxtWithI18n(options))).collections.find(c => c.name === 'notes')!.i18n

    expect(await notesI18n({ modules: [['@nuxtjs/i18n', { locales: ['en', 'fr'] }]], i18n: { defaultLocale: 'en' } })).toEqual({ locales: ['en', 'fr'], defaultLocale: 'en' })
    expect(await notesI18n({ modules: [['@nuxtjs/i18n', { defaultLocale: 'en' }]], i18n: { locales: ['en', 'fr'] } })).toEqual({ locales: ['en', 'fr'], defaultLocale: 'en' })
    expect(await notesI18n({ modules: [['@nuxtjs/i18n', { locales: ['de'], defaultLocale: 'de' }]], i18n: { locales: ['en', 'fr'], defaultLocale: 'en' } })).toEqual({ locales: ['de', 'en', 'fr'], defaultLocale: 'de' })
    expect(await notesI18n({ modules: ['@nuxtjs/i18n'], i18n: { locales: ['en', { code: 'en', file: 'en.json' }, { code: 'fr' }], defaultLocale: 'en' } })).toEqual({ locales: ['en', 'fr'], defaultLocale: 'en' })
  })

  it('adds up the inline @nuxtjs/i18n locales of every layer', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({
      modules: [['@nuxtjs/i18n', { locales: ['en', 'fr'], defaultLocale: 'en' }], ['@nuxtjs/i18n', { locales: ['de'], defaultLocale: 'de' }]],
    }))

    expect(collections.find(collection => collection.name === 'notes')!.i18n).toEqual({ locales: ['en', 'fr', 'de'], defaultLocale: 'en' })
  })

  it('disables `i18n: true` without @nuxtjs/i18n', async () => {
    const { collections } = await loadContentConfig(nuxtWithI18n({ modules: [] }))
    const notes = collections.find(collection => collection.name === 'notes')!

    expect(notes.i18n).toBeUndefined()
    expect(notes.fields.locale).toBeUndefined()
  })
})
