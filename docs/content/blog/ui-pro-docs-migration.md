---
title: Migrate UIPro Docs Starter
description: Migrate the UI Pro Docs starter from Content v2 and UI Pro v1 to
  Content x UI v3.
image:
  src: /blog/nuxt-studio-v2.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
date: 2025-01-07T01:00:00.000Z
category: Migration
---

# Migrate to Content x UI v3

**2025 starts with the power of 3!**

This start of year is marked by major updates to our favorite tools. The UI team is about to launch **version 3** of the **UI / UI Pro libraries** (currently in alpha), while the Content team has already released **Nuxt Content v3**.

These updates mean that all our starter templates combining **Content** and **UI** will need to be updated to align with the latest versions. To help you make the transition, this guide walks through migrating the **Docs Starter** to the new **Content x UI v3** package.

## Content migration

### 1. Create `content.config.ts` file

This configuration file define your data structure. A collection represents a set of related items. In the case of the docs starter, there is two different collections, the `landing` collection representing the home page, one for the landing page and another for the doc pages.

```js [content.config.ts]
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md'
    }),
    docs: defineCollection({
      type: 'page',
      source: 'docs/**',
      schema: z.object({
        headline: z.string().optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
        })).optional(),
      }),
    }),
  }
})
```

On top of the built-in fields provided by the [`page`](/docs/collections/types#page-type) type, the `docs` collection needs extra fields representing `headline` and `links` that can be optionally display in the docs [page header](https://ui3.nuxt.dev/components/page-header).

::prose-tip
The `type: page` means there is a 1-to-1 relationship between the content file and a page on your site.
::

### 2. Migrate landing page

::prose-steps{level="4"}
#### Home page data fetching can be updated by moving from `queryContent` to `queryCollection` API.

  :::prose-code-group
  ```ts [old-index.vue]
  const { data: page } = await useAsyncData('index', () => queryContent('/').findOne())
  ```
  
  ```ts [new-index.vue]
  const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
  ```
  :::

#### `useSeoMeta` can be populated using the `seo` field provided by the [page](/docs/collections/types#page-type) type.

```ts [index.vue]
useSeoMeta({
  title: page.value.seo.title,
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
```

  :::prose-note
  Please note that the `seo` field is automatically overridden by the root `title` and `description` if empty.
  :::
::

### 3. Migrate catch-all docs page

::prose-steps{level="4"}
#### Docs page data and surround fetching can be updated and mutualised by moving from `queryContent` to `queryCollection` and `queryCollectionItemSurroundings` APIs.

  :::prose-code-group
  ```ts [docs/[...old-slug\\].vue]
  const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne())
  
  const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryContent()
    .where({ _extension: 'md', navigation: { $ne: false } })
    .only(['title', 'description', '_path'])
    .findSurround(withoutTrailingSlash(route.path))
  )
  ```
  
  ```ts [docs/[...new-slug\\].vue]
  const { data } = await useAsyncData(route.path, () => Promise.all([
    queryCollection('docs').path(route.path).first(),
    queryCollectionItemSurroundings('docs', route.path, {
      fields: ['title', 'description'],
    }),
  ]), {
    transform: ([page, surround]) => ({ page, surround }),
  })
  
  const page = computed(() => data.value?.page)
  const surround = computed(() => data.value?.surround)
  ```
  :::

#### `useSeoMeta` can be populated using the `seo` field provided by the [page](/docs/collections/types#page-type) type.

```ts [index.vue]
useSeoMeta({
  title: page.value.seo.title,
  ogTitle: `${page.value.seo.title} - ${seo?.siteName}`,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
```

  :::prose-note
  Please note that the `seo` field is automatically overridden by the root `title` and `description` if empty.
  :::
::
