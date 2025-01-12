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

**2025 kicks off with the power of 3!**

This start of year is marked by major updates to our favorite tools. The UI team is about to launch **version 3** of the **UI / UI Pro libraries** (currently in alpha), while the Content team has already released **Nuxt Content v3**.

These updates mean that all our starter templates combining **Content** and **UI** will need to be updated to align with the latest versions. To help you make the transition, this guide walks through migrating the **Docs Starter** to the new **Content x UI v3** package.

::prose-tip{to="https://github.com/nuxt-ui-pro/docs"}
Check the UI Pro documentation starter repository code source.
::

## Content migration (v2 → v3)

### 1. Update package to v3

::code-group
```bash [pnpm]
pnpm add @nuxt/content@next
```

```bash [yarn]
yarn add @nuxt/content@next
```

```bash [npm]
npm install @nuxt/content@next
```

```bash [bun]
bun add @nuxt/content@next
```
::

### 2. Create `content.config.ts` file

This configuration file define your data structure. A collection represents a set of related items. In the case of the docs starter, there is two different collections, the `landing` collection representing the home page, one for the landing page and another for the doc pages.

```js [content.config.ts]
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.yml'
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.yml']
      },
      schema: z.object({
        toc: z.boolean().optional(),
        headline: z.string().optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional()
        })).optional()
      })
    })
  }
})
```

On top of the built-in fields provided by the [`page`](/docs/collections/types#page-type) type, the `docs` collection needs extra fields:

- `headline` and `links` are strings that can be optionally display in the docs [page header](https://ui3.nuxt.dev/components/page-header)
- `toc` is a boolean used to toggle the display of the [table of content](https://ui3.nuxt.dev/components/page#within-a-page) on the page

::prose-tip
The `type: page` means there is a 1-to-1 relationship between the content file and a page on your site.
::

### 3. Migrate `app.vue`

::prose-steps{level="4"}
#### Navigation fetch can be updated by moving from `fetchContentNavigation` to `queryCollectionNavigation` method.

  :::prose-code-group
  ```ts [app.vue (v2)]
  const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
  ```
  
  ```ts [app.vue (v3)]
  const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
  
  ```
  :::

#### Content search command palette data can use the new `queryCollectionSearchSections` method.

  :::prose-code-group
  ```ts [app.vue (v2)]
  const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', {
    default: () => [],
    server: false
  })
  ```
  
  ```ts [app.vue (v3)]
  const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
    server: false,
  })
  ```
  :::
::

### 4. Migrate landing page

::prose-steps{level="4"}
#### Home page data fetching can be updated by moving from `queryContent` to `queryCollection` method.

  :::prose-code-group
  ```ts [index.vue (v2)]
  const { data: page } = await useAsyncData('index', () => queryContent('/').findOne())
  ```
  
  ```ts [index.vue (v3)]
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

### 5. Migrate catch-all docs page

::prose-steps{level="4"}
#### Docs page data and surround fetching can be updated and mutualised by moving from `queryContent` to `queryCollection` and `queryCollectionItemSurroundings` methods.

  :::prose-code-group
  ```ts [docs/[...slug\\].vue (v2)]
  const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne())
  
  const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryContent()
    .where({ _extension: 'md', navigation: { $ne: false } })
    .only(['title', 'description', '_path'])
    .findSurround(withoutTrailingSlash(route.path))
  )
  ```
  
  ```ts [docs/[...slug\\].vue (v3)]
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

### 6. Update types

Types have been significantly enhanced in Content v3, eliminating the need for most manual typings, as they are now directly provided by the Nuxt Content APIs.

Concerning the documentation starter, the only typing needed concerns the navigation items where `NavItem` can be replaced by `ContentNavigationItem` .

```ts
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
```

### 7. Replace folder metadata files

All `_dir.yml` files become `.navigation.yml`

### 8. Migrate Studio activation

Since the [studio module]() has been deprecated and a new generic preview API has been implemented directly into Nuxt Content, we can remove the `@nuxthq/studio` package from our dependancies and from the `nuxt.config.ts` modules.

Instead we just need to enable the preview mode in the Nuxt configuration file by binding the Studio API.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
})
```

Finally, in order to keep the [app config file updatable](/docs/studio/config) from Studio we just need to update the helper import of the `nuxt.schema.ts` file from `@nuxthq/studio/theme` to `@nuxt/content/preview` .

::prose-tip
That's it, content v3 is now powering the starter. Let's now migrate to the version 3 of [UI / UIPro](https://ui3.nuxt.dev).
::

## UIPro Migration (v1 → v3)

::prose-caution
This is a migration case, it won't cover all breaking changes introduced by the version upgrade. You should check each component you're using in the documentation to know if you need updates concerning props, slots or styles.
::

### 1. Setup package to v3

::prose-note
To maintain consistency with the UI versioning, which transitioned from v1 to v2. The UIPro version 2 is being skipped, and the update jumps directly to v3.
::

::prose-steps{level="4"}
#### Install the Nuxt UI v3 alpha package

  :::code-group{sync="pm"}
  ```bash [pnpm]
  pnpm add @nuxt/ui-pro@next
  ```
  
  ```bash [yarn]
  yarn add @nuxt/ui-pro@next
  ```
  
  ```bash [npm]
  npm install @nuxt/ui-pro@next
  ```
  
  ```bash [bun]
  bun add @nuxt/ui-pro@next
  ```
  :::

#### Add the module in the Nuxt configuration file

  :::prose-code-group
  ```ts [nuxt.config.ts (v1)]
  export default defineNuxtConfig({
    extends: ['@nuxt/ui-pro']
  })
  ```
  
  ```ts [nuxt.config.ts (v3)]
  export default defineNuxtConfig({
    modules: ['@nuxt/ui-pro']
  })
  ```
  :::

  :::prose-note
  **UIPro V3** is now considered as a module and no more as a layer.
  :::

#### Import Tailwind CSS and Nuxt UI Pro in your CSS

```css [assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui-pro";
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui-pro'],
  css: ['~/assets/css/main.css']
})
```
::

### 2. Update existing `ui` overrides in `app.config.ts`

::prose-caution{to="https://ui3.nuxt.dev/getting-started/theme#customize-theme"}
All overrides using the `ui` props in a component or the `ui` key in the `app.config.ts` are obsolete and need to be check in the **UI / UI Pro** documentation.
::

::prose-code-group
```ts [app.config.ts (v1)]
export default defineAppConfig({
  ui: {
    primary: 'green',
    gray: 'slate',
    footer: {
      bottom: {
        left: 'text-sm text-gray-500 dark:text-gray-400',
        wrapper: 'border-t border-gray-200 dark:border-gray-800'
      }
    }
  },
})
```

```ts [app.config.ts (v2)]
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    }
  },
  uiPro: {
    footer: {
      slots: {
        root: 'border-t border-gray-200 dark:border-gray-800',
        left: 'text-sm text-gray-500 dark:text-gray-400'
      }
    }
  },
}
```
::

### 3. Migrate `app.vue`

- `Main`, `Footer` and `LazyUContentSearch` components do not need any updates in our case.
- `Notification` component can be removed since `Toast` components are directly handled by the `App` component.
- `Header` component needs updates since `panel` slot has been replaced by `content` slot.
- Instead of the `NavigationTree` component you can use the `NavigationMenu` component or the `ContentNavigation` component to display content navigation.

::prose-code-group
```vue [header.vue (v1)]
<script>
// Content navigation provided by fetchContentNavigation()
const navigation = inject<Ref<NavItem[]>>('navigation')
</script>

<template>
  <UHeader>
    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" />
     </template>
   </UHeader>
</template>
```

```vue [header.vue (v3)]
<script>
// Content navigation provided by queryCollectionNavigation('docs')
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UHeader>
    <template #content>
      <UContentNavigation
        highlight
        :navigation="navigation"
      />
     </template>
   </UHeader>
</template>
```
::

### 4. Migrate `docs` layout

- `Aside` component has been renamed to `PageAside` .
- `ContentNavigation` component can be used (instead of `NavigationTree`) to display the content navigation returned by `queryCollectionNavigation` .

::prose-code-group
```vue [layout/docs.vue (v1)]
<template>
  <UContainer>
    <UPage>
      <template #left>
        <UAside>
          <UNavigationTree :links="mapContentNavigation(navigation)" />
        </UAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
```

```vue [layout/docs.vue (v3)]
<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation
            highlight
            :navigation="navigation"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
```
::

### 5. Update landing page

We've decided to move the landing content from `YML` to `Markdown` .

::prose-tip
This decision was made because components used in Markdown no longer need to be exposed globally (nor do they need to be created in the `components/content` folder). Content v3 handles it under the hood.
::

All landing components have been reorganised and standardised as generic `Page` components:

- `LandingHero` => `PageHero`
- `LandingSection` => `PageSection`
