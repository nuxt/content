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

Every instance created with `createNuxtContent()` registers the Comark `toc` and `headings` plugins by default:

- `toc` writes the table of contents to `meta.toc`. It collects `h2` and `h3` headings, like v3 did.
- `headings` writes the text of a leading `h1` to `meta.title` and the paragraph that follows it to `meta.description`. The nodes stay in the rendered body.

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
