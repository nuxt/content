import { join } from 'pathe'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { createLocaleVariantTracker, defuByIndex, expandI18nData, detectLocaleFromPath } from '../../src/utils/i18n'
import { z } from 'zod'
import { defineCollection, generateCollectionItemInserts, resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'
import { contentTypesTemplate } from '../../src/utils/templates'
import { parseContent } from '../utils/content'
import type { CollectionI18nConfig } from '../../src/types/collection'
import type { ParsedContentFile } from '../../src/types'
import { logger } from '../../src/utils/dev'

const i18nConfig: CollectionI18nConfig = {
  locales: ['en', 'fr', 'de'],
  defaultLocale: 'en',
}

describe('i18n', () => {
  describe('inline expansion', () => {
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

      const items = expandI18nData(content, i18nConfig)

      expect(items).toHaveLength(3)
      expect(items[0]).toMatchObject({ id: 'blog:post.yml', locale: 'en', title: 'My Post', description: 'Hello world' })
      expect(items[0].meta.i18n).toBeUndefined()
      expect(items[1]).toMatchObject({ id: 'blog:post.yml#fr', locale: 'fr', title: 'Mon Article', description: 'Bonjour le monde' })
      expect(items[2]).toMatchObject({ id: 'blog:post.yml#de', locale: 'de', title: 'Mein Artikel', description: 'Hello world' })
    })

    it('returns single item with default locale when no i18n section', () => {
      const content: ParsedContentFile = {
        id: 'blog:simple.yml',
        title: 'Simple Post',
        stem: 'simple',
        extension: 'yml',
        meta: {},
      }

      const items = expandI18nData(content, i18nConfig)

      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({ locale: 'en', title: 'Simple Post' })
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

      const items = expandI18nData(content, i18nConfig)

      expect(items).toHaveLength(2)
      expect(items[0]).toMatchObject({ locale: 'fr', title: 'Mon Article' })
      expect(items[1]).toMatchObject({ locale: 'en', title: 'My Post' })
    })

    it('deep-merges nested objects in locale overrides', () => {
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

      const items = expandI18nData(content, i18nConfig)

      expect(items).toHaveLength(2)
      expect(items[0].info).toEqual({ age: 25, country: 'Switzerland' })
      expect(items[1].info).toEqual({ age: 25, country: 'Schweiz' })
    })

    it('deep-merges array items by index, preserving untranslated fields', () => {
      const content: ParsedContentFile = {
        id: 'nav:navbar.yml',
        items: [
          { id: 'overview', label: 'Overview', route: '/' },
          { id: 'tech', label: 'Technologies', route: '/technologies' },
        ],
        stem: 'navbar',
        extension: 'yml',
        meta: {
          i18n: {
            fr: {
              items: [
                { label: 'Vue d\'ensemble' },
                { label: 'Technologies' },
              ],
            },
          },
        },
      }

      const items = expandI18nData(content, i18nConfig)
      const frItem = items.find(i => i.locale === 'fr')

      expect(frItem?.items).toEqual([
        { id: 'overview', label: 'Vue d\'ensemble', route: '/' },
        { id: 'tech', label: 'Technologies', route: '/technologies' },
      ])
    })

    it('does not include default locale in expanded items', () => {
      const content: ParsedContentFile = {
        id: 'blog:post.yml',
        title: 'My Post',
        stem: 'post',
        extension: 'yml',
        meta: {
          i18n: {
            en: { title: 'English Post' },
            fr: { title: 'Article Francais' },
          },
        },
      }

      const items = expandI18nData(content, i18nConfig)

      expect(items).toHaveLength(2)
      expect(items[0]).toMatchObject({ locale: 'en', title: 'My Post' })
      expect(items[1]).toMatchObject({ locale: 'fr' })
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

      const items = expandI18nData(content, i18nConfig)
      const ids = items.map(i => i.id)

      expect(ids).toEqual([
        'data:team/member.json',
        'data:team/member.json#fr',
        'data:team/member.json#de',
      ])
      expect(new Set(ids).size).toBe(3)
    })

    it('replaces body wholesale for page collections instead of deep-merging', () => {
      const defaultBody = { type: 'root', children: [{ type: 'text', value: 'Hello' }] }
      const frBody = { type: 'root', children: [{ type: 'text', value: 'Bonjour' }] }

      const content: ParsedContentFile = {
        id: 'pages:index.yml',
        title: 'Home',
        body: defaultBody,
        stem: 'index',
        extension: 'yml',
        meta: {
          i18n: {
            fr: { title: 'Accueil', body: frBody },
          },
        },
      }

      const items = expandI18nData(content, i18nConfig, 'page')
      const frItem = items.find(i => i.locale === 'fr')

      // Body should be replaced, not deep-merged
      expect(frItem?.body).toEqual(frBody)
      expect(frItem?.body).not.toEqual(defaultBody)
      expect(frItem?.title).toBe('Accueil')
    })

    it('deep-merges body for data collections (no replacement)', () => {
      const content: ParsedContentFile = {
        id: 'data:config.yml',
        title: 'Config',
        body: { nested: { key: 'value', other: 'kept' } },
        stem: 'config',
        extension: 'yml',
        meta: {
          i18n: {
            fr: { body: { nested: { key: 'valeur' } } },
          },
        },
      }

      const items = expandI18nData(content, i18nConfig, 'data')
      const frItem = items.find(i => i.locale === 'fr')

      // Body should be deep-merged for data collections
      expect(frItem?.body).toMatchObject({ nested: { key: 'valeur', other: 'kept' } })
    })
  })

  describe('path-based locale detection', () => {
    it('detects locale from first path segment', () => {
      const result = detectLocaleFromPath('/fr/blog/post', 'fr/blog/post', i18nConfig)
      expect(result).toMatchObject({ locale: 'fr', path: '/blog/post', stem: 'blog/post' })
    })

    it('assigns default locale when no locale prefix', () => {
      const result = detectLocaleFromPath('/blog/post', 'blog/post', i18nConfig)
      expect(result).toMatchObject({ locale: 'en', path: '/blog/post', stem: 'blog/post' })
    })

    it('handles the index page of a locale directory', () => {
      const result = detectLocaleFromPath('/de', 'de/index', i18nConfig)
      expect(result).toMatchObject({ locale: 'de', path: '/', stem: 'index' })
    })

    it('does not treat a file named after a locale as a locale directory', () => {
      expect(detectLocaleFromPath('/de', 'de', i18nConfig)).toEqual({ locale: 'en', path: '/de', stem: 'de' })
      expect(detectLocaleFromPath('/docs/fr', 'docs/fr', i18nConfig, 'docs')).toEqual({ locale: 'en', path: '/docs/fr', stem: 'docs/fr' })
    })

    it('does not treat non-locale segments as locale', () => {
      const result = detectLocaleFromPath('/blog/fr/post', 'blog/fr/post', i18nConfig)
      expect(result).toMatchObject({ locale: 'en', path: '/blog/fr/post', stem: 'blog/fr/post' })
    })

    it('detects the locale from the stem, not a custom path prefix', () => {
      // A custom front-matter `path` can put a locale segment on the path while
      // the file lives in a non-locale directory. Detection keys off the stem, so
      // the locale stays the default and the custom path is left untouched.
      const result = detectLocaleFromPath('/fr/docs/guide', 'docs/guide', i18nConfig)
      expect(result).toMatchObject({ locale: 'en', path: '/fr/docs/guide', stem: 'docs/guide' })
    })

    it('strips the stem locale segment without touching a non-matching custom path', () => {
      // File at `fr/bar` with a custom `path: /custom`. The locale comes from the
      // stem (`fr`), the stem is stripped, and the custom path is preserved.
      const result = detectLocaleFromPath('/custom', 'fr/bar', i18nConfig)
      expect(result).toMatchObject({ locale: 'fr', path: '/custom', stem: 'bar' })
    })

    it('handles nested locale paths', () => {
      const result = detectLocaleFromPath('/en/docs/guide/intro', 'en/docs/guide/intro', i18nConfig)
      expect(result).toMatchObject({ locale: 'en', path: '/docs/guide/intro', stem: 'docs/guide/intro' })
    })

    it('matches locale directories case-insensitively and strips the lowercased path segment', () => {
      const config = { locales: ['en', 'pt-BR'], defaultLocale: 'en' }
      expect(detectLocaleFromPath('/pt-br/guide/intro', 'pt-BR/guide/intro', config))
        .toEqual({ locale: 'pt-BR', path: '/guide/intro', stem: 'guide/intro' })
      expect(detectLocaleFromPath('/pt-br', 'pt-br/index', config))
        .toEqual({ locale: 'pt-BR', path: '/', stem: 'index' })
    })

    it('detects the locale directory right after the source prefix', () => {
      expect(detectLocaleFromPath('/docs/fr/guide', 'docs/fr/guide', i18nConfig, 'docs'))
        .toEqual({ locale: 'fr', path: '/docs/guide', stem: 'docs/guide' })
      expect(detectLocaleFromPath('/navigation/navbar', 'fr/navigation/navbar', i18nConfig, 'fr/navigation'))
        .toEqual({ locale: 'fr', path: '/navigation/navbar', stem: 'navigation/navbar' })
    })

    it('ignores locale-like directories deeper than the first one after the source prefix', () => {
      expect(detectLocaleFromPath('/docs/guides/de/setup', 'docs/guides/de/setup', i18nConfig, 'docs'))
        .toEqual({ locale: 'en', path: '/docs/guides/de/setup', stem: 'docs/guides/de/setup' })
    })

    it('detects locale directories under a fixed source directory when parsing', async () => {
      await initiateValidatorsContext()
      const collection = resolveCollection('docs', defineCollection({
        type: 'page',
        source: 'docs/**',
        schema: z.object({}),
        i18n: i18nConfig,
      }))!

      const parsed = await parseContent('docs/docs/fr/guide.md', '# Guide', collection)

      expect(parsed).toMatchObject({ locale: 'fr', path: '/docs/guide', stem: 'docs/guide' })
    })

    it('normalizes the source prefix like the content id when parsing', async () => {
      await initiateValidatorsContext()
      for (const prefix of ['/docs//guide', '/docs/./guide']) {
        const collection = resolveCollection('docs', defineCollection({
          type: 'page',
          source: { include: 'guide/**', prefix },
          schema: z.object({}),
          i18n: i18nConfig,
        }))!

        const parsed = await parseContent(join('docs', prefix, 'fr/intro.md'), '# Intro', collection)

        expect(parsed).toMatchObject({ locale: 'fr', path: '/docs/guide/intro', stem: 'docs/guide/intro' })
      }
    })
  })

  describe('generated types', () => {
    it('types the locale column once, keeping a user declaration', async () => {
      await initiateValidatorsContext()
      const collections = [
        resolveCollection('posts', defineCollection({ type: 'page', source: '*/posts/**', schema: z.object({ locale: z.enum(['en', 'fr']) }), i18n: i18nConfig }))!,
        resolveCollection('team', defineCollection({ type: 'data', source: 'team/*.yml', schema: z.object({ name: z.string() }), i18n: i18nConfig }))!,
        resolveCollection('notes', defineCollection({ type: 'data', source: 'notes/*.yml', schema: z.object({ name: z.string() }) }))!,
      ]

      const types = await contentTypesTemplate(collections).getContents({ options: { collections } } as never)
      const declaration = (name: string) => types.slice(types.indexOf(`interface ${name}CollectionItem`)).split('\n  }')[0]!

      expect(declaration('Posts').match(/locale/g)).toHaveLength(1)
      expect(declaration('Posts')).toMatch(/locale: \("en" \| "fr"\)/)
      expect(declaration('Team')).toMatch(/locale: string/)
      expect(declaration('Notes')).not.toMatch(/locale/)
    })
  })

  describe('defuByIndex', () => {
    it('merges nested arrays recursively', () => {
      const base = {
        items: [
          { title: 'Base', links: [{ title: 'More', url: '/page', icon: { name: 'chevron' } }] },
        ],
      }
      const override = {
        items: [
          { title: 'Override', links: [{ title: 'Savoir plus' }] },
        ],
      }
      const result = defuByIndex(override, base) as typeof base

      expect(result.items[0]).toMatchObject({
        title: 'Override',
        links: [{ title: 'Savoir plus', url: '/page', icon: { name: 'chevron' } }],
      })
    })

    it('does not mutate input objects', () => {
      const base = { items: [{ a: 1, b: 2 }] }
      const override = { items: [{ a: 10 }] }
      const baseCopy = JSON.parse(JSON.stringify(base))
      const overrideCopy = JSON.parse(JSON.stringify(override))
      defuByIndex(override, base)
      expect(base).toEqual(baseCopy)
      expect(override).toEqual(overrideCopy)
    })

    describe('edge cases', () => {
      it('preserves extra default array items when override has fewer', () => {
        const content: ParsedContentFile = {
          id: 'nav:navbar.yml',
          items: [
            { id: 'a', label: 'A', route: '/a' },
            { id: 'b', label: 'B', route: '/b' },
            { id: 'c', label: 'C', route: '/c' },
          ],
          stem: 'navbar',
          extension: 'yml',
          meta: {
            i18n: {
              fr: {
                items: [
                  { label: 'A-fr' },
                  { label: 'B-fr' },
                ],
              },
            },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const frItem = items.find(i => i.locale === 'fr')

        expect(frItem?.items).toHaveLength(3)
        expect(frItem?.items[0]).toMatchObject({ id: 'a', label: 'A-fr', route: '/a' })
        expect(frItem?.items[1]).toMatchObject({ id: 'b', label: 'B-fr', route: '/b' })
        expect(frItem?.items[2]).toMatchObject({ id: 'c', label: 'C', route: '/c' })
      })

      it('deep-merges nested arrays within array items', () => {
        const content: ParsedContentFile = {
          id: 'nav:banners.yml',
          items: [
            {
              description: 'Default text',
              links: [
                { title: 'More', url: '/page', icon: { name: 'chevron' } },
              ],
            },
          ],
          stem: 'banners',
          extension: 'yml',
          meta: {
            i18n: {
              fr: {
                items: [
                  {
                    description: 'Texte francais',
                    links: [{ title: 'En savoir plus' }],
                  },
                ],
              },
            },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const frItem = items.find(i => i.locale === 'fr')

        expect(frItem?.items[0]).toMatchObject({
          description: 'Texte francais',
          links: [{ title: 'En savoir plus', url: '/page', icon: { name: 'chevron' } }],
        })
      })

      it('handles empty i18n overrides object', () => {
        const content: ParsedContentFile = {
          id: 'data:config.yml',
          title: 'Config',
          stem: 'config',
          extension: 'yml',
          meta: { i18n: {} },
        }

        const items = expandI18nData(content, i18nConfig)
        expect(items).toHaveLength(1)
        expect(items[0]).toMatchObject({ locale: 'en', title: 'Config' })
      })

      it('does not mutate original content or override objects', () => {
        const original = {
          id: 'data:test.yml',
          items: [{ label: 'Original', route: '/' }],
          stem: 'test',
          extension: 'yml',
          meta: {
            i18n: { fr: { items: [{ label: 'French' }] } },
          },
        } as ParsedContentFile

        const originalItemsRef = original.items
        const frOverrideRef = (original.meta.i18n as Record<string, unknown>).fr

        expandI18nData(original, i18nConfig)

        expect(originalItemsRef[0].label).toBe('Original')
        expect((frOverrideRef as Record<string, unknown[]>).items[0]).toEqual({ label: 'French' })
      })

      it('handles override with extra array items beyond default length', () => {
        const content: ParsedContentFile = {
          id: 'nav:test.yml',
          items: [{ id: 'a', label: 'A' }],
          stem: 'test',
          extension: 'yml',
          meta: {
            i18n: {
              fr: {
                items: [
                  { label: 'A-fr' },
                  { id: 'b', label: 'B-fr', route: '/b' },
                ],
              },
            },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const frItem = items.find(i => i.locale === 'fr')

        expect(frItem?.items).toHaveLength(2)
        expect(frItem?.items[0]).toMatchObject({ id: 'a', label: 'A-fr' })
        expect(frItem?.items[1]).toMatchObject({ id: 'b', label: 'B-fr', route: '/b' })
      })

      it('handles scalar arrays without merging', () => {
        const content: ParsedContentFile = {
          id: 'data:tags.yml',
          tags: ['javascript', 'vue', 'nuxt'],
          stem: 'tags',
          extension: 'yml',
          meta: {
            i18n: { de: { tags: ['JavaScript', 'Vue', 'Nuxt'] } },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const deItem = items.find(i => i.locale === 'de')
        expect(deItem?.tags).toEqual(['JavaScript', 'Vue', 'Nuxt'])
      })

      it('replaces scalar arrays wholesale when override is shorter than default', () => {
        // A shorter scalar override must NOT pad-fill from the default tail.
        // When authors intentionally provide a shorter list, they want exactly
        // that.
        const content: ParsedContentFile = {
          id: 'data:tags.yml',
          tags: ['javascript', 'vue', 'nuxt', 'content'],
          stem: 'tags',
          extension: 'yml',
          meta: {
            i18n: { fr: { tags: ['javascript', 'vue'] } },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const frItem = items.find(i => i.locale === 'fr')
        expect(frItem?.tags).toEqual(['javascript', 'vue'])
      })

      it('replaces with empty scalar override (clears the list)', () => {
        const content: ParsedContentFile = {
          id: 'data:tags.yml',
          tags: ['a', 'b', 'c'],
          stem: 'tags',
          extension: 'yml',
          meta: {
            i18n: { fr: { tags: [] } },
          },
        }
        const items = expandI18nData(content, i18nConfig)
        expect(items.find(i => i.locale === 'fr')?.tags).toEqual([])
      })

      it('preserves non-translated top-level fields across all locales', () => {
        const content: ParsedContentFile = {
          id: 'data:config.yml',
          title: 'Site Config',
          apiUrl: 'https://api.example.com',
          maxRetries: 3,
          stem: 'config',
          extension: 'yml',
          meta: {
            i18n: {
              fr: { title: 'Config du site' },
              de: { title: 'Seitenkonfiguration' },
            },
          },
        }

        const items = expandI18nData(content, i18nConfig)

        for (const item of items) {
          expect(item).toMatchObject({ apiUrl: 'https://api.example.com', maxRetries: 3 })
        }
        expect(items[1]).toMatchObject({ title: 'Config du site' })
        expect(items[2]).toMatchObject({ title: 'Seitenkonfiguration' })
      })

      it('merges arrays whose items are themselves arrays by index', () => {
        // Regression: an array of arrays used to collapse its first inner array to
        // an empty object when passed through `defu`.
        const content: ParsedContentFile = {
          id: 'data:matrix.yml',
          rows: [['a', 'b'], ['c', 'd']],
          stem: 'matrix',
          extension: 'yml',
          meta: {
            i18n: { fr: { rows: [['x', 'y']] } },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const frItem = items.find(i => i.locale === 'fr')

        // First inner array is overridden wholesale (scalar), second preserved.
        expect(frItem?.rows).toEqual([['x', 'y'], ['c', 'd']])
      })
    })

    describe('override safety', () => {
      it('ignores identity-field overrides so row identity is preserved', () => {
        const content: ParsedContentFile = {
          id: 'data:team.yml',
          name: 'Jane',
          stem: 'data/team',
          extension: 'yml',
          meta: {
            i18n: {
              fr: { name: 'Jeanne', stem: 'data/equipe', id: 'evil', locale: 'de', extension: 'json' },
            },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const frItem = items.find(i => i.id === 'data:team.yml#fr')

        expect(frItem).toBeDefined()
        expect(frItem?.name).toBe('Jeanne')
        // Identity fields keep the source row's values.
        expect(frItem?.stem).toBe('data/team')
        expect(frItem?.locale).toBe('fr')
        expect(frItem?.extension).toBe('yml')
      })

      it('skips locale keys that are not in the collection locales', () => {
        const content: ParsedContentFile = {
          id: 'data:team.yml',
          name: 'Jane',
          stem: 'data/team',
          extension: 'yml',
          meta: {
            i18n: {
              fr: { name: 'Jeanne' },
              es: { name: 'Juana' },
            },
          },
        }

        const items = expandI18nData(content, i18nConfig)
        const locales = items.map(i => i.locale)

        expect(locales).toContain('fr')
        expect(locales).not.toContain('es')
        expect(items).toHaveLength(2)
      })
    })
  })

  describe('item inserts', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('drops only a translation that cannot be stored', async () => {
      await initiateValidatorsContext()
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
      const team = resolveCollection('team', defineCollection({
        type: 'data',
        source: 'team/*.yml',
        schema: z.object({ name: z.string(), role: z.string().optional(), joined: z.date().optional() }),
        i18n: i18nConfig,
      }))!
      const parsed = (joined: string) => ({
        id: 'team/team/x.yml',
        stem: 'team/x',
        extension: 'yml',
        name: 'X',
        joined,
        meta: { i18n: { fr: { joined: '1er janvier 2024' }, de: { role: 'Testerin' } } },
      }) as ParsedContentFile

      expect(generateCollectionItemInserts(team, parsed('2024-01-01')).map(({ item }) => item.id)).toEqual(['team/team/x.yml', 'team/team/x.yml#de'])
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Inline i18n in "team/team/x.yml" for locale "fr" is ignored'))
      expect(() => generateCollectionItemInserts(team, parsed('nope'))).toThrow()
    })
  })

  describe('override handling', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    const warnings = () => vi.spyOn(logger, 'warn').mockImplementation(() => {})

    it('ignores overrides of the parsed Markdown body and excerpt', () => {
      const warn = warnings()
      const body = { type: 'minimark', value: [['p', {}, 'Hello']] }
      const excerpt = { type: 'minimark', value: [['p', {}, 'Intro']] }
      const unsafe = { type: 'minimark', value: [['div', { onmouseover: 'alert(1)' }, 'x']] }
      const items = expandI18nData({
        id: 'docs:index.md',
        stem: 'index',
        extension: 'md',
        title: 'Hello',
        body,
        meta: { excerpt, i18n: { fr: { title: 'Bonjour', body: unsafe, excerpt: unsafe } } },
      }, i18nConfig, 'page', ['title', 'body'])

      expect(items[1]).toMatchObject({ locale: 'fr', title: 'Bonjour', body, meta: { excerpt } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('`body`'))
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('`excerpt`'))
    })

    it('decides from the file id, not an extension set in front matter', () => {
      warnings()
      const body = { type: 'minimark', value: [['p', {}, 'Hello']] }
      const [, fr] = expandI18nData({
        id: 'docs:index.MD',
        stem: 'index',
        extension: 'yml',
        body,
        meta: { i18n: { fr: { body: { type: 'minimark', value: [['iframe', { srcdoc: 'x' }]] } } } },
      }, i18nConfig, 'page', ['body'])

      expect(fr?.body).toEqual(body)
    })

    it('treats an id like the parser does, using its last extension', () => {
      warnings()
      const body = { type: 'minimark', value: [['p', {}, 'Hello']] }
      const [, fr] = expandI18nData({
        id: 'docs:notes.yml#.md',
        stem: 'notes',
        body,
        meta: { i18n: { fr: { body: { type: 'minimark', value: [['a', { href: 'javascript:alert(1)' }, 'x']] } } } },
      }, i18nConfig, 'page', ['body'])

      expect(fr?.body).toEqual(body)
    })

    it('ignores prototype keys in overrides', () => {
      const body = { type: 'minimark', value: [['p', {}, 'Hello']] }
      const block = JSON.parse('{ "title": "Bonjour", "__proto__": { "body": { "type": "minimark", "value": [] }, "excerpt": {} } }')
      const content = (): ParsedContentFile => ({ id: 'docs:index.md', stem: 'index', title: 'Hello', body, meta: { i18n: { fr: block } } })

      for (const schemaKeys of [undefined, ['title', 'body']]) {
        const [, fr] = expandI18nData(content(), i18nConfig, 'page', schemaKeys)
        expect(fr).toMatchObject({ title: 'Bonjour', body })
        expect(Object.hasOwn(fr!.meta, 'excerpt')).toBe(false)
      }
      expect(({} as Record<string, unknown>).body).toBeUndefined()
    })

    it('derives seo from translated title and description unless seo is set explicitly', () => {
      const derived = expandI18nData({
        id: 'docs:a.md',
        stem: 'a',
        extension: 'md',
        title: 'Getting started',
        description: 'How to start',
        seo: { title: 'Getting started', description: 'How to start' },
        meta: { i18n: { fr: { title: 'Bien démarrer', description: 'Comment commencer' } } },
      }, i18nConfig, 'page', ['title', 'description', 'seo'])
      expect(derived[1]?.seo).toEqual({ title: 'Bien démarrer', description: 'Comment commencer' })

      const explicit = expandI18nData({
        id: 'docs:b.md',
        stem: 'b',
        extension: 'md',
        title: 'Getting started',
        description: 'How to start',
        seo: { title: 'Getting started | ACME', description: 'How to start' },
        meta: { i18n: { fr: { title: 'Bien démarrer', seo: { description: 'Description FR' } } } },
      }, i18nConfig, 'page', ['title', 'description', 'seo'])
      expect(explicit[1]?.seo).toEqual({ title: 'Getting started | ACME', description: 'Description FR' })
    })

    it('keeps the source item when its own-locale block is too deep to compare', () => {
      const warn = warnings()
      let tree: unknown = 'leaf'
      for (let i = 0; i < 20_000; i++) {
        tree = [{ child: tree }]
      }

      const items = expandI18nData({
        id: 'data:deep.json',
        stem: 'deep',
        name: 'Deep',
        tree,
        meta: { i18n: { en: { tree }, de: { name: 'Tief' } } },
      }, i18nConfig, 'data', ['name', 'tree'])

      expect(items.map(item => item.locale)).toEqual(['en', 'de'])
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('own locale "en"'))
    })

    it('escapes control characters in the locale names it logs', () => {
      const warn = warnings()
      const locale = '\u001B[2K\rfr'
      expandI18nData({ id: 'team/a.yml', stem: 'a', name: 'A', meta: { i18n: { [locale]: 'x', [`${locale}2`]: { name: 'B' } } } } as never, i18nConfig, 'data', ['name'])
      expandI18nData({ id: 'team/b.yml', stem: 'b', name: 'A', locale, meta: { i18n: { [locale]: { name: 'B' } } } } as never, i18nConfig, 'data', ['name'])
      const track = createLocaleVariantTracker('team')
      track({ id: 'team/c.yml', stem: 'c', locale } as never)
      track({ id: 'team/c.json', stem: 'c', locale } as never)

      const messages = warn.mock.calls.map(([message]) => String(message))
      expect(messages).toHaveLength(4)
      for (const message of messages) {
        // eslint-disable-next-line no-control-regex
        expect(message).not.toMatch(/[\u0000-\u001F]/)
      }
    })

    it('derives seo from translated title and description in data collections with a seo field', () => {
      const items = expandI18nData({
        id: 'products:shoe.yml',
        stem: 'shoe',
        extension: 'yml',
        title: 'Shoe',
        description: 'A shoe',
        seo: { title: 'Shoe', description: 'A shoe' },
        meta: { i18n: { fr: { title: 'Chaussure', description: 'Une chaussure' } } },
      }, i18nConfig, 'data', ['title', 'description', 'seo'])

      expect(items[0]?.seo).toEqual({ title: 'Shoe', description: 'A shoe' })
      expect(items[1]?.seo).toEqual({ title: 'Chaussure', description: 'Une chaussure' })
    })

    it('applies translations of fields outside the schema to meta', () => {
      const content = (tagline: string, image: string): ParsedContentFile => ({
        id: 'docs:a.md',
        stem: 'a',
        title: 'Hello',
        meta: {
          tagline,
          hero: { title: 'Hi', image },
          i18n: { fr: { title: 'Bonjour', tagline: 'Slogan', hero: { title: 'Salut' }, meta: { _i18nSourceHash: 'forged' } } },
        },
      })

      const [en, fr] = expandI18nData(content('English', '/a.png'), i18nConfig, 'page', ['title'])
      expect(en?.meta).toEqual({ tagline: 'English', hero: { title: 'Hi', image: '/a.png' } })
      expect(fr).toMatchObject({
        title: 'Bonjour',
        meta: { tagline: 'Slogan', hero: { title: 'Salut', image: '/a.png' } },
      })
      expect(fr?.meta._i18nSourceHash).not.toBe('forged')

      const hashOf = (tagline: string, image: string) => expandI18nData(content(tagline, image), i18nConfig, 'page', ['title'])[1]?.meta._i18nSourceHash
      expect(hashOf('English', '/b.png')).toBe(fr?.meta._i18nSourceHash)
      expect(hashOf('Changed', '/a.png')).not.toBe(fr?.meta._i18nSourceHash)
    })

    it('keeps the source item when the i18n section is malformed', () => {
      const warn = warnings()

      const scalar = expandI18nData({ id: 'data:a.yml', stem: 'a', name: 'A', meta: { i18n: 'fr' } }, i18nConfig, 'data', ['name'])
      expect(scalar).toEqual([expect.objectContaining({ name: 'A', locale: 'en', meta: {} })])

      const blocks = expandI18nData({
        id: 'data:b.yml',
        stem: 'b',
        name: 'B',
        meta: { i18n: { fr: null, de: 'Hallo' } },
      }, i18nConfig, 'data', ['name'])
      expect(blocks.map(item => item.locale)).toEqual(['en'])
      expect(warn).toHaveBeenCalledTimes(2)
    })

    it('keeps the source item and other locales when one locale cannot be expanded', () => {
      const warn = warnings()
      let deep: unknown = 'leaf'
      let deepOverride: unknown = 'feuille'
      for (let i = 0; i < 20_000; i++) {
        deep = [{ child: deep }]
        deepOverride = [{ child: deepOverride }]
      }

      const items = expandI18nData({
        id: 'data:deep.json',
        stem: 'deep',
        name: 'Deep',
        tree: deep,
        meta: { i18n: { fr: { tree: deepOverride }, de: { name: 'Tief' } } },
      }, i18nConfig, 'data', ['name', 'tree'])

      expect(items.map(item => item.locale)).toEqual(['en', 'de'])
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"fr"'))
    })

    it('warns about a block for the source locale only when it differs from the top-level values', () => {
      const warn = warnings()
      const content = (en: string): ParsedContentFile => ({
        id: 'data:a.yml',
        stem: 'a',
        description: 'Fallback',
        meta: { i18n: { en: { description: en }, fr: { description: 'Texte' } } },
      })

      expandI18nData(content('Fallback'), i18nConfig, 'data', ['description'])
      expect(warn).not.toHaveBeenCalled()

      const [en] = expandI18nData(content('English'), i18nConfig, 'data', ['description'])
      expect(en?.description).toBe('Fallback')
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('own locale "en"'))
    })

    it('keeps the default item for a null entry in an array of objects', () => {
      const [, fr] = expandI18nData({
        id: 'data:nav.yml',
        stem: 'nav',
        links: [{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }],
        meta: { i18n: { fr: { links: [null, { label: 'Le blog' }] } } },
      }, i18nConfig, 'data', ['links'])

      expect(fr?.links).toEqual([{ label: 'Home', to: '/' }, { label: 'Le blog', to: '/blog' }])
    })
  })

  describe('duplicate locale variants', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('warns when two rows are the same locale version of a stem', () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
      const track = createLocaleVariantTracker('docs')

      track({ id: 'docs/en/guide.md#fr', locale: 'fr', stem: 'guide' })
      track({ id: 'docs/en/guide.md', locale: 'en', stem: 'guide' })
      expect(warn).not.toHaveBeenCalled()

      track({ id: 'docs/fr/guide.md', locale: 'fr', stem: 'guide' })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"docs/en/guide.md#fr" and "docs/fr/guide.md"'))
    })
  })

  describe('source hash for change tracking', () => {
    it('adds _i18nSourceHash to non-default locale items', () => {
      const content: ParsedContentFile = {
        id: 'blog:post.yml',
        title: 'My Post',
        description: 'Hello',
        stem: 'post',
        extension: 'yml',
        meta: {
          i18n: { fr: { title: 'Mon Article' } },
        },
      }

      const items = expandI18nData(content, i18nConfig)

      expect(items[0].meta._i18nSourceHash).toBeUndefined()
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
        meta: { i18n: { fr: { title: 'Mon Article' } } },
      }

      const content2: ParsedContentFile = {
        id: 'blog:post.yml',
        title: 'My Post',
        description: 'Hello',
        untranslatedField: 'different value',
        stem: 'post',
        extension: 'yml',
        meta: { i18n: { fr: { title: 'Mon Article' } } },
      }

      const items1 = expandI18nData(content1, i18nConfig)
      const items2 = expandI18nData(content2, i18nConfig)

      expect(items1[1].meta._i18nSourceHash).toBe(items2[1].meta._i18nSourceHash)
    })

    it('source hash changes when default locale translated fields change', () => {
      const content1: ParsedContentFile = {
        id: 'blog:post.yml',
        title: 'My Post',
        stem: 'post',
        extension: 'yml',
        meta: { i18n: { fr: { title: 'Mon Article' } } },
      }

      const content2: ParsedContentFile = {
        id: 'blog:post.yml',
        title: 'My Updated Post',
        stem: 'post',
        extension: 'yml',
        meta: { i18n: { fr: { title: 'Mon Article' } } },
      }

      const items1 = expandI18nData(content1, i18nConfig)
      const items2 = expandI18nData(content2, i18nConfig)

      expect(items1[1].meta._i18nSourceHash).not.toBe(items2[1].meta._i18nSourceHash)
    })

    it('source hash captures only translated nested leaves, not sibling fields', () => {
      // `de` translates only `info.country`. Changing the untranslated sibling
      // `info.age` must NOT change the hash, because the hash is scoped to the
      // translated leaf.
      const base = {
        id: 'team:jane.yml',
        name: 'Jane',
        stem: 'jane',
        extension: 'yml',
      }
      const content1: ParsedContentFile = {
        ...base,
        info: { age: 25, country: 'Switzerland' },
        meta: { i18n: { de: { info: { country: 'Schweiz' } } } },
      }
      const content2: ParsedContentFile = {
        ...base,
        info: { age: 30, country: 'Switzerland' },
        meta: { i18n: { de: { info: { country: 'Schweiz' } } } },
      }

      const de1 = expandI18nData(content1, i18nConfig).find(i => i.locale === 'de')
      const de2 = expandI18nData(content2, i18nConfig).find(i => i.locale === 'de')

      expect(de1?.meta._i18nSourceHash).toBe(de2?.meta._i18nSourceHash)
    })

    it('source hash ignores untranslated fields of translated array items', () => {
      const hashFor = (to: string) => expandI18nData({
        id: 'data:nav.yml',
        stem: 'nav',
        links: [{ label: 'Home', to }],
        meta: { i18n: { fr: { links: [{ label: 'Accueil' }] } } },
      }, i18nConfig, 'data', ['links'])[1]?.meta._i18nSourceHash

      const hashForTags = (tags: string[]) => expandI18nData({
        id: 'data:tags.yml',
        stem: 'tags',
        tags,
        meta: { i18n: { fr: { tags: ['un'] } } },
      }, i18nConfig, 'data', ['tags'])[1]?.meta._i18nSourceHash

      expect(hashFor('/home')).toBe(hashFor('/'))
      expect(hashForTags(['one', 'two'])).not.toBe(hashForTags(['one']))
    })

    it('source hash is per-locale: a field translated only in another locale does not affect this locale\'s hash', () => {
      // `fr` translates only `title`, while `de` translates only `description`.
      // Changing `description` between `content1` and `content2` must NOT
      // change `fr`'s hash (because `fr` does not translate `description`) but
      // MUST change `de`'s hash.
      const content1: ParsedContentFile = {
        id: 'blog:post.yml',
        title: 'My Post',
        description: 'Original description',
        stem: 'post',
        extension: 'yml',
        meta: {
          i18n: {
            fr: { title: 'Mon Article' },
            de: { description: 'Beschreibung' },
          },
        },
      }
      const content2: ParsedContentFile = {
        ...content1,
        description: 'Updated description',
        meta: {
          i18n: {
            fr: { title: 'Mon Article' },
            de: { description: 'Beschreibung' },
          },
        },
      }

      const items1 = expandI18nData(content1, i18nConfig)
      const items2 = expandI18nData(content2, i18nConfig)

      const fr1 = items1.find(i => i.locale === 'fr')!
      const fr2 = items2.find(i => i.locale === 'fr')!
      const de1 = items1.find(i => i.locale === 'de')!
      const de2 = items2.find(i => i.locale === 'de')!

      expect(fr1.meta._i18nSourceHash).toBe(fr2.meta._i18nSourceHash)
      expect(de1.meta._i18nSourceHash).not.toBe(de2.meta._i18nSourceHash)
    })
  })

  describe('page collection body replacement', () => {
    it('replaces wholesale when override sets body to null', () => {
      // Edge case. An override that explicitly clears the body. Without an
      // `'in' overrides` check, this would deep-merge the default AST back in.
      const defaultBody = { type: 'root', children: [{ type: 'text', value: 'Hi' }] }
      const content: ParsedContentFile = {
        id: 'pages:index.yml',
        title: 'Home',
        body: defaultBody,
        stem: 'index',
        extension: 'yml',
        meta: { i18n: { fr: { title: 'Accueil', body: null } } },
      }

      const items = expandI18nData(content, i18nConfig, 'page')
      const frItem = items.find(i => i.locale === 'fr')

      expect(frItem?.body).toBeNull()
    })
  })
})
