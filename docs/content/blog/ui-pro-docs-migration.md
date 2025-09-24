---
title: Migrate Nuxt UI Pro Documentation Starter
description: How to upgrade your Nuxt UI Pro documentation to Content and UI v3
image:
  src: /blog/migrate-docs-starter.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
date: 2025-01-21T01:00:00.000Z
category: Migration
---

# How to upgrade your Nuxt documentation website to Content x UI v3

**2025 kicks off with the power of 3!**

This start of year is marked by major updates to our favorite tools. The UI team is about to launch **version 3** of the **UI / UI Pro libraries** (currently in alpha), while the Content team has already released **Nuxt Content v3**.

These updates mean that all our starter templates combining **Content** and **UI** will need to be updated to align with the latest versions. To help you make the transition, this guide walks through migrating the **Nuxt UI Pro Docs Starter** to the new **Content v3 and Nuxt UI v3** packages.

::prose-tip{to="https://github.com/nuxt-ui-pro/docs/tree/v3"}
Check the UI Pro documentation starter repository source code.
::

## Content migration (v2 → v3)

### 1. Update package to v3

::code-group
```bash [pnpm]
pnpm add @nuxt/content@^3
```

```bash [yarn]
yarn add @nuxt/content@^3
```

```bash [npm]
npm install @nuxt/content@^3
```

```bash [bun]
bun add @nuxt/content@^3
```
::

### 2. Create `content.config.ts` file

This configuration file defines your data structure. A collection represents a set of related items. In the case of the docs starter, there are two different collections, the `landing` collection representing the home page and another `docs` collection for the documentation pages.

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

On top of the built-in fields provided by the [`page`](/docs/collections/types#page-type) type, we added the extra field `links` to the `docs` collection so we can optionally display them in the docs [page header](https://ui3.nuxt.dev/components/page-header).

::prose-tip
The `type: page` means there is a 1-to-1 relationship between the content file and a page on your site.
::

### 3. Migrate `app.vue`

::prose-steps{level="4"}
#### Navigation fetch can be updated by moving from `fetchContentNavigation` to `queryCollectionNavigation` method

  :::prose-code-group
  ```ts [app.vue (v3)]
  const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
  
  ```
  
  ```ts [app.vue (v2)]
  const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
  ```
  :::

#### Content search command palette data can use the new `queryCollectionSearchSections` method

  :::prose-code-group
  ```ts [app.vue (v3)]
  const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
    server: false,
  })
  ```
  
  ```ts [app.vue (v2)]
  const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', {
    default: () => [],
    server: false
  })
  ```
  :::
::

### 4. Migrate landing page

::prose-steps{level="4"}
#### Home page data fetching can be updated by moving from `queryContent` to `queryCollection` method

  :::prose-code-group
  ```ts [index.vue (v3)]
  const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
  ```
  
  ```ts [index.vue (v2)]
  const { data: page } = await useAsyncData('index', () => queryContent('/').findOne())
  ```
  :::

#### `useSeoMeta` can be populated using the `seo` field provided by the [page](/docs/collections/types#page-type) type

```ts [index.vue]
useSeoMeta({
  title: page.value.seo.title,
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
```

  :::prose-note
  Please note that the `seo` field is automatically overridden by the root `title` and `description` if not set.
  :::
::

### 5. Migrate catch-all docs page

::prose-steps{level="4"}
#### Docs page data and surround fetching can be updated and mutualised by moving from `queryContent` to `queryCollection` and `queryCollectionItemSurroundings` methods

  :::prose-code-group
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
  
  ```ts [docs/[...slug\\].vue (v2)]
  const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne())
  
  const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryContent()
    .where({ _extension: 'md', navigation: { $ne: false } })
    .only(['title', 'description', '_path'])
    .findSurround(withoutTrailingSlash(route.path))
  )
  ```
  :::

#### Populate `useSeoMeta` with the `seo` field provided by the [page](/docs/collections/types#page-type) type

```ts [index.vue]
useSeoMeta({
  title: page.value.seo.title,
  ogTitle: `${page.value.seo.title} - ${seo?.siteName}`,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
```

  :::prose-note
  Please note that the `seo` field is automatically overridden by the root `title` and `description` if not set.
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

Since the [studio module](https://nuxt.studio) has been deprecated and a new generic `Preview API` has been implemented directly into Nuxt Content, we can remove the `@nuxthq/studio` package from our dependencies and from the `nuxt.config.ts` modules.

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

Finally, in order to keep the [app config file updatable](/docs/studio/config) from Studio, we just need to update the helper import of the `nuxt.schema.ts` file from `@nuxthq/studio/theme` to `@nuxt/content/preview`.

::prose-tip
That's it, content v3 is now powering the starter. Let's now migrate to version 3 of [Nuxt UI / UI Pro](https://ui3.nuxt.dev).
::

## Nuxt UI Pro Migration (v1 → v3)

::prose-caution
This is a migration case, it won't cover all breaking changes introduced by the version upgrade. You should check each component you're using in the documentation to know if you need updates concerning props, slots or styles.
::

### 1. Setup package to v3

::prose-note
To maintain consistency with the UI versioning, which transitioned from v1 to v2. The Nuxt UI Pro version 2 is being skipped, and the update jumps directly to v3.
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

It's no longer required to add `@nuxt/ui` in modules as it is automatically imported by `@nuxt/ui-pro` .

  :::prose-code-group
  ```ts [nuxt.config.ts (v3)]
  export default defineNuxtConfig({
    modules: ['@nuxt/ui-pro']
  })
  ```
  
  ```ts [nuxt.config.ts (v1)]
  export default defineNuxtConfig({
    extends: ['@nuxt/ui-pro'],
    modules: ['@nuxt/ui']
  })
  ```
  :::

  :::prose-note
  **Nuxt UIPro V3** is now considered as a module and no longer as a layer.
  :::

#### Import Tailwind CSS and Nuxt UI Pro in your CSS

```css [assets/css/main.css]
@import "tailwindcss" theme(static);
@import "@nuxt/ui-pro";
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui-pro'],
  css: ['~/assets/css/main.css']
})
```

#### Remove tailwind config file and use CSS-first theming

Nuxt UI v3 uses Tailwind CSS v4 that follows a CSS-first configuration approach. You can now customize your theme with CSS variables inside a `@theme` directive.

- Delete the `tailwind.config.ts` file
- Use the `@theme` directive to apply your theme in `main.css` file
- Use the `@source` directive in order for Tailwind to detect classes in `markdown` files.

```css [assets/css/main.css]
@import "tailwindcss" theme(static);
@import "@nuxt/ui-pro";

@source "../content/**/*";

@theme {
  --font-sans: 'DM Sans', sans-serif;

  --color-green-50: #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}

```
::

### 2. Update `ui` overloads in `app.config.ts`

::prose-caution{to="https://ui3.nuxt.dev/getting-started/theme#customize-theme"}
All overloads using the `ui` props in a component or the `ui` key in the `app.config.ts` are obsolete and need to be checked in the **UI / UI Pro** documentation.
::

::prose-code-group
```ts [app.config.ts (v3)]
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
::

### 3. Migrate `error.vue` page

New `UError` component can be used as full page structure.

::prose-code-group
```vue [error.vue (v3)]
<template>
  <div>
    <AppHeader />

    <UError :error="error" />

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </div>
</template>
```

```vue [error.vue (v1)]
<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UPageError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>

    <UNotifications />
  </div>
</template>
```
::

### 4. Migrate `app.vue` page

- `Main`, `Footer` and `LazyUContentSearch` components do not need any updates in our case.
- `Notification` component can be removed since `Toast` components are directly handled by the `App` component.
- Instead of the `NavigationTree` component you can use the `NavigationMenu` component or the `ContentNavigation` component to display content navigation.

::prose-code-group
```vue [Header.vue (v3)]
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

```vue [Header.vue (v1)]
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
::

### 5. Update landing page

We've decided to move the landing content from `YML` to `Markdown` .

::prose-tip
This decision was made because components used in Markdown no longer need to be exposed globally (nor do they need to be created in the `components/content` folder). Content v3 handles it under the hood.
::

::prose-steps{level="4"}
#### Update content configuration

```ts [content.config.ts]
export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md'
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.md']
      },
      ...
    })
  }
})
```

#### Use `ContentRenderer` to render `Markdown`

  :::prose-note
  `prose` property must be set to `false` in `ContentRendered` as we don't want `Mardown` to be applied with prose styling in the case of a landing page integrating non prose Vue components.
  :::

  :::prose-code-group
  ```vue [index.vue (v3)]
  <template>
    <UContainer>
      <ContentRenderer
        v-if="page"
        :value="page"
        :prose="false"
      />
    </UContainer>
  </template>
  ```
  
  ```vue [index.vue (v1)]
  <template>
    <div>
      <ULandingHero
        v-if="page.hero"
        v-bind="page.hero"
      >
        <template #headline>
          <UBadge
            v-if="page.hero.headline"
            variant="subtle"
            size="lg"
            class="relative rounded-full font-semibold"
          >
            <NuxtLink
              :to="page.hero.headline.to"
              target="_blank"
              class="focus:outline-none"
              tabindex="-1"
            >
              <span
                class="absolute inset-0"
                aria-hidden="true"
              />
            </NuxtLink>
  
            {{ page.hero.headline.label }}
  
            <UIcon
              v-if="page.hero.headline.icon"
              :name="page.hero.headline.icon"
              class="ml-1 w-4 h-4 pointer-events-none"
            />
          </UBadge>
        </template>
  
        <template #title>
          <MDC cache-key="head-title" :value="page.hero.title" />
        </template>
  
        <MDC
          :value="page.hero.code"
          cache-key="head-code"
          class="prose prose-primary dark:prose-invert mx-auto"
        />
      </ULandingHero>
  
      <ULandingSection
        :title="page.features.title"
        :links="page.features.links"
      >
        <UPageGrid>
          <ULandingCard
            v-for="(item, index) of page.features.items"
            :key="index"
            v-bind="item"
          />
        </UPageGrid>
      </ULandingSection>
    </div>
  </template>
  ```
  :::

#### Migrate Vue components to MDC

Move all components in `index.md` following the [MDC syntax](/docs/files/markdown).

Landing components have been reorganised and standardised as generic `Page` components.

- `LandingHero` => `PageHero`
- `LandingSection` => `PageSection`
- `LandingCard` => `PageCard` (we'll use the `PageFeature` instead)

  :::prose-tip{to="https://github.com/nuxt-ui-pro/docs/blob/v3/content/index.md"}
  Have a look at the final `Markdown` result on GitHub.
  :::
::

### 6. Migrate docs page

::prose-steps{level="4"}
#### Layout

- `Aside` component has been renamed to `PageAside` .
- `ContentNavigation` component can be used (instead of `NavigationTree`) to display the content navigation returned by `queryCollectionNavigation`.

  :::prose-code-group
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
  :::

#### Catch-all pages

- `Divider` has been renamed to `Separator`
- `findPageHeadline` must be imported from `#ui-pro/utils/content`
- `prose` property does not exist no more on `PageBody` component.
::

::prose-tip{to="https://github.com/nuxt-ui-pro/docs/tree/v3"}
That's it! The docs starter is now fully running on both UI and Content v3 🎉
::

## Edit on Studio

If you're using Nuxt Studio to edit your documentation you also need to migrate the related code.

The Studio module has been deprecated and a new generic `Preview API` has been implemented directly into Nuxt Content, you can remove the `@nuxthq/studio` package from your dependencies and from the`nuxt.config.ts` modules. Instead you just need to enable the preview mode in the Nuxt configuration file by binding the Studio API.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
})
```

In order to keep the app config file updatable from Studio you need to update the helper import of the `nuxt.schema.ts` file from `@nuxthq/studio/theme` to `@nuxt/content/preview`.

:video{autoplay controls loop poster="https://res.cloudinary.com/nuxt/video/upload/v1737458923/studio/docs-v3_lqfasl.png" src="https://res.cloudinary.com/nuxt/video/upload/v1737458923/studio/docs-v3_lqfasl.mp4"}
