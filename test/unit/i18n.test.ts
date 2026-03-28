import { describe, it, expect } from 'vitest'
import { hash } from 'ohash'
import type { CollectionI18nConfig } from '../../src/types/collection'
import type { ParsedContentFile } from '../../src/types'

/**
 * Expand inline i18n data from a parsed content file into per-locale items.
 * This is the same logic used in processCollectionItems (src/module.ts).
 */
function expandI18n(
  parsedContent: ParsedContentFile,
  i18nConfig: CollectionI18nConfig,
): ParsedContentFile[] {
  const i18nData = parsedContent.meta?.i18n as Record<string, Record<string, unknown>> | undefined
  if (!i18nData) {
    if (!parsedContent.locale) {
      parsedContent.locale = i18nConfig.defaultLocale
    }
    return [parsedContent]
  }

  const { i18n: _removed, ...cleanMeta } = parsedContent.meta
  parsedContent.meta = cleanMeta

  if (!parsedContent.locale) {
    parsedContent.locale = i18nConfig.defaultLocale
  }

  // Compute source hash from default locale's translatable fields
  const translatedFields = new Set(Object.values(i18nData).flatMap(Object.keys))
  const sourceFields: Record<string, unknown> = {}
  for (const field of translatedFields) {
    sourceFields[field] = parsedContent[field]
  }
  const i18nSourceHash = hash(sourceFields)

  const items: ParsedContentFile[] = [parsedContent]

  for (const [locale, overrides] of Object.entries(i18nData)) {
    if (locale === parsedContent.locale) continue

    // Shallow spread: overrides replace whole top-level fields (not deep-merge)
    const localeItem: ParsedContentFile = {
      ...parsedContent,
      ...overrides,
      id: `${parsedContent.id}#${locale}`,
      locale,
      meta: { ...cleanMeta, _i18nSourceHash: i18nSourceHash },
    }

    items.push(localeItem)
  }

  return items
}

/**
 * Detect locale from path prefix and strip it.
 * This is the same logic used in createParser (src/utils/content/index.ts).
 */
/**
 * Mirrors the production logic in src/utils/content/index.ts exactly.
 */
function detectLocaleFromPath(
  path: string,
  stem: string,
  i18nConfig: CollectionI18nConfig,
): { locale: string, path: string, stem: string } {
  const pathParts = path.split('/').filter(Boolean)
  const firstPart = pathParts[0]

  if (firstPart && i18nConfig.locales.includes(firstPart)) {
    const pathWithoutLocale = '/' + pathParts.slice(1).join('/')

    // Stem stripping: same string logic as production (no RegExp)
    let newStem = stem
    if (stem === firstPart) {
      newStem = ''
    }
    else if (stem.startsWith(firstPart + '/')) {
      newStem = stem.slice(firstPart.length + 1)
    }

    return {
      locale: firstPart,
      path: pathWithoutLocale === '/' ? '/' : pathWithoutLocale,
      stem: newStem,
    }
  }

  return {
    locale: i18nConfig.defaultLocale,
    path,
    stem,
  }
}

describe('i18n - inline expansion', () => {
  const i18nConfig: CollectionI18nConfig = {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  }

  it('expands inline i18n to per-locale items', () => {
    const content: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Post',
      description: 'Hello world',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: {
          fr: { title: 'Mon Article', description: 'Bonjour le monde' },
          de: { title: 'Mein Artikel' },
        },
      },
    }

    const items = expandI18n(content, i18nConfig)

    expect(items).toHaveLength(3)

    // Default locale item
    expect(items[0].id).toBe('blog:post.yml')
    expect(items[0].locale).toBe('en')
    expect(items[0].title).toBe('My Post')
    expect(items[0].description).toBe('Hello world')
    expect(items[0].meta.i18n).toBeUndefined()

    // French item
    expect(items[1].id).toBe('blog:post.yml#fr')
    expect(items[1].locale).toBe('fr')
    expect(items[1].title).toBe('Mon Article')
    expect(items[1].description).toBe('Bonjour le monde')

    // German item - description falls back to default
    expect(items[2].id).toBe('blog:post.yml#de')
    expect(items[2].locale).toBe('de')
    expect(items[2].title).toBe('Mein Artikel')
    expect(items[2].description).toBe('Hello world')
  })

  it('returns single item with default locale when no i18n section', () => {
    const content: ParsedContentFile = {
      id: 'blog:simple.yml',
      title: 'Simple Post',
      stem: 'simple',
      extension: 'yml',
      meta: {},
    }

    const items = expandI18n(content, i18nConfig)

    expect(items).toHaveLength(1)
    expect(items[0].locale).toBe('en')
    expect(items[0].title).toBe('Simple Post')
  })

  it('preserves existing locale on parsed content', () => {
    const content: ParsedContentFile = {
      id: 'blog:post.yml',
      locale: 'fr',
      title: 'Mon Article',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: {
          en: { title: 'My Post' },
        },
      },
    }

    const items = expandI18n(content, i18nConfig)

    expect(items).toHaveLength(2)
    expect(items[0].locale).toBe('fr')
    expect(items[0].title).toBe('Mon Article')
    expect(items[1].locale).toBe('en')
    expect(items[1].title).toBe('My Post')
  })

  it('shallow-replaces nested objects in locale overrides', () => {
    const content: ParsedContentFile = {
      id: 'team:jane.yml',
      name: 'Jane Doe',
      info: { age: 25, country: 'Switzerland' },
      stem: 'jane',
      extension: 'yml',
      meta: {
        i18n: {
          de: { info: { country: 'Schweiz' } },
        },
      },
    }

    const items = expandI18n(content, i18nConfig)

    expect(items).toHaveLength(2)

    // Default keeps original
    expect(items[0].info).toEqual({ age: 25, country: 'Switzerland' })

    // German override replaces the whole `info` object (shallow spread, not deep-merge)
    // This prevents corrupting complex objects like body AST
    expect(items[1].info).toEqual({ country: 'Schweiz' })
  })

  it('does not include default locale in expanded items', () => {
    const content: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Post',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: {
          en: { title: 'English Post' }, // same as default locale
          fr: { title: 'Article Francais' },
        },
      },
    }

    const items = expandI18n(content, i18nConfig)

    // Should have 2 items: default (en) + fr
    // The 'en' key in i18n is skipped since it matches defaultLocale
    expect(items).toHaveLength(2)
    expect(items[0].locale).toBe('en')
    expect(items[0].title).toBe('My Post') // top-level value, not from i18n.en
    expect(items[1].locale).toBe('fr')
  })

  it('generates unique IDs with locale suffix', () => {
    const content: ParsedContentFile = {
      id: 'data:team/member.json',
      name: 'John',
      stem: 'team/member',
      extension: 'json',
      meta: {
        i18n: {
          fr: { name: 'Jean' },
          de: { name: 'Johann' },
        },
      },
    }

    const items = expandI18n(content, i18nConfig)
    const ids = items.map(i => i.id)

    expect(ids).toEqual([
      'data:team/member.json',
      'data:team/member.json#fr',
      'data:team/member.json#de',
    ])

    // All IDs are unique
    expect(new Set(ids).size).toBe(3)
  })
})

describe('i18n - path-based locale detection', () => {
  const i18nConfig: CollectionI18nConfig = {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  }

  it('detects locale from first path segment', () => {
    const result = detectLocaleFromPath('/fr/blog/post', 'fr/blog/post', i18nConfig)

    expect(result.locale).toBe('fr')
    expect(result.path).toBe('/blog/post')
    expect(result.stem).toBe('blog/post')
  })

  it('assigns default locale when no locale prefix', () => {
    const result = detectLocaleFromPath('/blog/post', 'blog/post', i18nConfig)

    expect(result.locale).toBe('en')
    expect(result.path).toBe('/blog/post')
    expect(result.stem).toBe('blog/post')
  })

  it('handles root path with locale', () => {
    const result = detectLocaleFromPath('/de', 'de', i18nConfig)

    expect(result.locale).toBe('de')
    expect(result.path).toBe('/')
    expect(result.stem).toBe('')
  })

  it('does not treat non-locale segments as locale', () => {
    const result = detectLocaleFromPath('/blog/fr/post', 'blog/fr/post', i18nConfig)

    // 'blog' is not a locale, so default is used
    expect(result.locale).toBe('en')
    expect(result.path).toBe('/blog/fr/post')
    expect(result.stem).toBe('blog/fr/post')
  })

  it('handles nested locale paths', () => {
    const result = detectLocaleFromPath('/en/docs/guide/intro', 'en/docs/guide/intro', i18nConfig)

    expect(result.locale).toBe('en')
    expect(result.path).toBe('/docs/guide/intro')
    expect(result.stem).toBe('docs/guide/intro')
  })
})

describe('i18n - source hash for change tracking', () => {
  const i18nConfig: CollectionI18nConfig = {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  }

  it('adds _i18nSourceHash to non-default locale items', () => {
    const content: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Post',
      description: 'Hello',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: {
          fr: { title: 'Mon Article' },
        },
      },
    }

    const items = expandI18n(content, i18nConfig)

    // Default locale should NOT have _i18nSourceHash
    expect(items[0].meta._i18nSourceHash).toBeUndefined()

    // French locale SHOULD have _i18nSourceHash
    expect(items[1].meta._i18nSourceHash).toBeDefined()
    expect(typeof items[1].meta._i18nSourceHash).toBe('string')
  })

  it('source hash is based on translated fields only', () => {
    const content1: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Post',
      description: 'Hello',
      untranslatedField: 'ignored',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: { fr: { title: 'Mon Article' } },
      },
    }

    const content2: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Post',
      description: 'Hello',
      untranslatedField: 'different value',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: { fr: { title: 'Mon Article' } },
      },
    }

    const items1 = expandI18n(content1, i18nConfig)
    const items2 = expandI18n(content2, i18nConfig)

    // Hash should be the same since only 'title' is translated and it's unchanged
    expect(items1[1].meta._i18nSourceHash).toBe(items2[1].meta._i18nSourceHash)
  })

  it('source hash changes when default locale translated fields change', () => {
    const content1: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Post',
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: { fr: { title: 'Mon Article' } },
      },
    }

    const content2: ParsedContentFile = {
      id: 'blog:post.yml',
      title: 'My Updated Post', // title changed
      stem: 'post',
      extension: 'yml',
      meta: {
        i18n: { fr: { title: 'Mon Article' } },
      },
    }

    const items1 = expandI18n(content1, i18nConfig)
    const items2 = expandI18n(content2, i18nConfig)

    // Hash should differ because source 'title' changed
    expect(items1[1].meta._i18nSourceHash).not.toBe(items2[1].meta._i18nSourceHash)
  })
})
