# Migrating to comark-content

Nuxt Content 4 is built on [comark-content](https://content.comark.dev). Several names from the earlier `@comark/cms` package were renamed upstream — update your app accordingly.

## Renames

| Old | New |
| --- | --- |
| `createCMS` | `comarkContent` |
| `createCMSClient` | `createContentClient` |
| `createNuxtContentCMS` | `createNuxtContent` |
| `ComarkCMS` | `ComarkContent` |
| `CMSClient` | `ContentClient` |
| `CMSOptions` | `ContentOptions` |
| `CMSFile` / `CMSListFile` | `ContentFile` / `ContentListFile` |
| `CMSPlugin` / `CMSClientPlugin` | `ContentPlugin` / `ContentClientPlugin` |
| `ComarkRegistry` | `ContentRegistry` |
| `sources: { … }` on one instance | one `source` per instance, compose with `contentHub([...])` |
| `cache: { loadManifest, loadSnapshot }` | `withSnapshot(source, snapshotLoader, manifestLoader?)` |
| `generateNavigationTree` | `generateNavigation` |
| `comark-content/plugins/sql-query.client` | `comark-content/plugins/sql-query/client` |
| `server/cms.ts` | `server/content.ts` |
| `export const cms` | `export const content` |
| auto-imported `cms` | auto-imported `content` |
| `@nuxt/content/cms` | `@nuxt/content/content` |

## `<ContentRenderer>` is now `<ContentDocument>`

Render a document with `<ContentDocument>`. It's Comark's `<MarkdownDocument>` with your content components built in, so it takes the same props (`value`, `components`, `data`, `transformNode`, ...). It accepts a document returned by `content.get()` or by `queryCollection()`:

```diff
- <ContentRenderer v-if="page" :value="page" />
+ <ContentDocument v-if="page" :value="page" />
```

Compared to v3's `<ContentRenderer>`:

- There's no `empty` slot: render the fallback with `v-if`/`v-else`.
- `components` values are components: names (`{ p: 'MyParagraph' }`) aren't resolved, import the component instead.
- `value` is a Comark document (`{ nodes, frontmatter, meta }`). `queryCollection()` documents also carry `nodes` and `frontmatter`, but a hand-built v3 document with only `body` doesn't render.

`<ContentRenderer>` still works as a deprecated alias, as part of the v3 compatibility layer, and keeps the `empty` slot, component names and `body`-only documents. It's registered while `content.compatibilityVersion` is `3` (the default), its generated type is marked `@deprecated`, and in development it logs a warning once. With `compatibilityVersion: 4`, only `<ContentDocument>` is registered.

## Server config

```ts
// server/content.ts
import { createNuxtContent } from '@nuxt/content/content'
import fs from 'comark-content/sources/fs'
import media from 'comark-content/plugins/media'

export const content = createNuxtContent({
  mode: 'hybrid',
  // single source
  name: 'content',
  source: fs('content', { cwd: import.meta.rootDir }),
  plugins: [media()],
})

// or several named sources → contentHub under the hood
export const content = createNuxtContent({
  mode: 'hybrid',
  sources: {
    docs: fs('content/docs', { cwd: import.meta.rootDir, prefix: '/docs' }),
    blog: fs('content/blog', { cwd: import.meta.rootDir, prefix: '/blog' }),
  },
})
```

### Sources provided by a layer

A layer's `server/content.ts` is used when the project has none: the project's file comes first, then each layer's by priority. Without any `server/content.ts`, the v3 `content.config.ts` files of every layer are merged as before. With `content.compatibilityVersion: 4`, `content.config.ts` files are ignored, with a warning.

## App config

Plugins passed to `server/content.ts` only run on the server. In hybrid mode, the browser has its own content instance, loaded from the prerendered snapshot. With `compatibilityVersion: 4`, add plugins to it in `app/content.ts`:

```ts
// app/content.ts
import { createNuxtContent } from '@nuxt/content/app'
import livePreview from 'comark-content/plugins/live-preview'

export const content = createNuxtContent({
  // Every instance of a hub gets them.
  plugins: [livePreview()],
})
```

The `content` it exports is the one the auto-imported `content` reads. In server-only mode the browser reads through the server, and the v3 compatibility layer creates its own browser instance, so `app/content.ts` isn't used in either case.

## Code highlighting

The v3 `content.build.markdown.highlight` option keeps working, but `shiki` is no longer bundled. Install it in your project to enable highlighting:

```bash
npx nypm add shiki
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  content: {
    build: {
      markdown: {
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['python'], // added on top of the v3 defaults
        },
      },
    },
  },
})
```

- If `shiki` is missing, the module logs a warning (and offers to install it in interactive dev) and code blocks render unhighlighted.
- Supported theme keys are `default` (or `light`) and `dark`. Dark colors apply under `html.dark`, as in v3.
- The plugin is injected into every instance created with `createNuxtContent()`. If you register your own `shiki` plugin under `markdown.plugins`, yours is used instead.

## Table of contents and headings

Every instance created with `createNuxtContent()` registers the Comark `toc`, `title-description` and `heading-links` plugins by default:

- `toc` writes the table of contents to `meta.toc`. It collects `h2` and `h3` headings, like v3 did.
- `title-description` (formerly `headings`) writes the text of a leading `h1` to `meta.title` and the paragraph that follows it to `meta.description`. The nodes stay in the rendered body.
- `heading-links` links `h2` to `h4` headings to themselves, as v3's `content.renderer.anchorLinks` did: `<h2 id="setup"><a href="#setup">Setup</a></h2>`. `content.renderer.anchorLinks` keeps working.

To change their options, register your own plugin with the same name under `markdown.plugins`:

```ts
// server/content.ts
import { createNuxtContent } from '@nuxt/content/content'
import fs from 'comark-content/sources/fs'
import toc from 'comark/plugins/toc'

export const content = createNuxtContent({
  mode: 'hybrid',
  source: fs('content', { cwd: import.meta.rootDir }),
  markdown: {
    plugins: [toc({ depth: 3 })],
  },
})
```

With Nuxt UI, `heading-links` isn't registered: Nuxt UI's `Prose*` heading components add the links themselves, as in v3, and both would nest a link inside another. `content.renderer.anchorLinks` still picks the levels, through `runtimeConfig.public.mdc.headings.anchorLinks`, which Nuxt UI reads. If your own `ProseH2` (or `H2`) component adds a link, set `content.renderer.anchorLinks` to `false`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  content: {
    renderer: {
      anchorLinks: false, // or { h2: true, h3: false } to pick levels
    },
  },
})
```

## Direct comark-content usage

```diff
- import { createCMS } from 'comark-content'
+ import { comarkContent } from 'comark-content'
  import fs from 'comark-content/sources/fs'

- export const content = createCMS({
-   sources: { content: fs('./content') },
- })
+ export const content = comarkContent({
+   source: fs('./content'),
+ })
```

Several sources:

```ts
import { comarkContent, contentHub } from 'comark-content'

const docs = comarkContent('docs', { source: fs('./docs', { prefix: '/docs' }) })
const blog = comarkContent('blog', { source: fs('./blog', { prefix: '/blog' }) })
export const content = contentHub([docs, blog])
```

## Queries with simple path filtering

```diff
- const doc = queryCollection(version.value.collection).path(path.value).first()
+ const doc = content.get(path.value)
```
