/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - v3 config: evaluated through the `readContentConfigSources` shim, not the real `@nuxt/content` exports.
import type { DefinedCollection } from '@nuxt/content'
import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { useNuxt } from '@nuxt/kit'
import { joinURL } from 'ufo'
import { landingPageExists, docsFolderExists } from './utils/pages'

const { options } = useNuxt()
const cwd = joinURL(options.rootDir, 'content')
const locales = options.i18n?.locales

const hasLandingPage = landingPageExists(options.rootDir)
const hasDocsFolder = docsFolderExists(options.rootDir)

const createDocsSchema = () => z.object({
  links: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
})

let collections: Record<string, DefinedCollection>

if (locales && Array.isArray(locales)) {
  collections = {}
  for (const locale of locales) {
    const code = (typeof locale === 'string' ? locale : locale.code).replace('-', '_')
    const hasLocaleDocs = docsFolderExists(options.rootDir, code)

    if (!hasLandingPage) {
      collections[`landing_${code}`] = defineCollection({
        type: 'page',
        source: {
          cwd,
          include: `${code}/index.md`,
        },
      })
    }

    collections[`docs_${code}`] = defineCollection({
      type: 'page',
      source: {
        cwd,
        include: hasLocaleDocs ? `${code}/docs/**` : `${code}/**/*`,
        prefix: hasLocaleDocs ? `/${code}/docs` : `/${code}`,
        exclude: [`${code}/index.md`],
      },
      schema: createDocsSchema(),
    })
  }
}
else {
  collections = {
    docs: defineCollection({
      type: 'page',
      source: {
        cwd,
        include: hasDocsFolder ? 'docs/**' : '**',
        prefix: hasDocsFolder ? '/docs' : '/',
        exclude: ['index.md'],
      },
      schema: createDocsSchema(),
    }),
  }

  // Only define landing collection if user doesn't have their own index.vue
  if (!hasLandingPage) {
    collections.landing = defineCollection({
      type: 'page',
      source: {
        cwd,
        include: 'index.md',
      },
    })
  }
}

export default defineContentConfig({ collections })
