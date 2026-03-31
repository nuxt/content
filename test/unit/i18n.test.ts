import { describe, it, expect } from 'vitest'
import { defuByIndex, expandI18nData, detectLocaleFromPath } from '../../src/utils/i18n'
import type { CollectionI18nConfig } from '../../src/types/collection'
import type { ParsedContentFile } from '../../src/types'

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

    it('handles root path with locale', () => {
      const result = detectLocaleFromPath('/de', 'de', i18nConfig)
      expect(result).toMatchObject({ locale: 'de', path: '/', stem: '' })
    })

    it('does not treat non-locale segments as locale', () => {
      const result = detectLocaleFromPath('/blog/fr/post', 'blog/fr/post', i18nConfig)
      expect(result).toMatchObject({ locale: 'en', path: '/blog/fr/post', stem: 'blog/fr/post' })
    })

    it('handles nested locale paths', () => {
      const result = detectLocaleFromPath('/en/docs/guide/intro', 'en/docs/guide/intro', i18nConfig)
      expect(result).toMatchObject({ locale: 'en', path: '/docs/guide/intro', stem: 'docs/guide/intro' })
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
  })
})
