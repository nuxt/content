# Migrating to comark-content

Nuxt Content 4 is built on [comark-content](https://content.comark.dev). Several CMS-era names were renamed upstream — update your app accordingly.

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

## Server config

```ts
// server/cms.ts (or server/utils/content.ts)
import { createNuxtContent } from '@nuxt/content/cms'
import fs from 'comark-content/sources/fs'
import media from 'comark-content/plugins/media'

export const cms = createNuxtContent({
  mode: 'hybrid',
  // single source
  name: 'content',
  source: fs('content', { cwd: import.meta.rootDir }),
  plugins: [media()],
})

// or several named sources → contentHub under the hood
export const cms = createNuxtContent({
  mode: 'hybrid',
  sources: {
    docs: fs('content/docs', { cwd: import.meta.rootDir, prefix: '/docs' }),
    blog: fs('content/blog', { cwd: import.meta.rootDir, prefix: '/blog' }),
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
export const cms = contentHub([docs, blog])
```

## Queries with simple path filtering

```diff
- const doc = queryCollection(version.value.collection).path(path.value).first()
+ const doc = cms.get(path.value)
```
