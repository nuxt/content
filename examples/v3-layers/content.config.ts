/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - v3 config: evaluated through the `readContentConfigSources` shim, not the real `@nuxt/content` exports.
import type { DefinedCollection } from '@nuxt/content'
import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { useNuxt } from '@nuxt/kit'

// Merged with the collections of `layer/content.config.ts`. Like the layer, this
// config is evaluated at build time, so it can read the Nuxt options.
const { options } = useNuxt()
const locales = options.i18n?.locales ?? []

const collections: Record<string, DefinedCollection> = {}
for (const locale of locales) {
  const code = (typeof locale === 'string' ? locale : locale.code).replace('-', '_')
  collections[`changelog_${code}`] = defineCollection({
    type: 'page',
    source: {
      include: `${code}/changelog/**`,
      prefix: `/${code}/changelog`,
    },
    schema: z.object({
      date: z.string().date(),
    }),
  })
}

export default defineContentConfig({ collections })
