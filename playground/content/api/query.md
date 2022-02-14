# Query API

Query layer provides server API and composables to search and query contents.

## Endpoints

Query server exposes one API:

- `/api/_content/query`

  Search/Query contents.

## Composables

**@nuxt/content** provide composables to work with content server:

- `useContentQuery`

  Query and fetch list of contents based on actions and conditions provides.

  ```js
  const contents = await useContentQuery()
    .where({ category: { $in: ['nature', 'people'] } })
    .limit(10)
    .find()
  ```

## Plugins

The layer can be extend using custom plugins.

With plugins users can extend query behaviors and add new features to it.

### Create plugin

```ts
// file `~/plugin-version.ts`
import { defineQueryPlugin } from '#imports'

export default defineQueryPlugin({
  name: 'version',
  queries: {
    version: params => {
      return v => {
        params.version = v
      }
    }
  },
  execute: (data, params) => {
    if (params.version) {
      return data.filter(v => v.version === params.version)
    }
  }
})
```

### Register plugin

```ts
// file `nuxt.config.ts`
import { defineNuxtConfig } from 'nuxt3'
import { resolveModule } from '@nuxt/kit'

export default defineNuxtConfig({
  content: {
    query: {
      plugins: [resolveModule('./plugin-version', { paths: __dirname })]
    }
  }
})
```

## Usage

```ts
const contents = await useContentQuery()
  .where({ category: { $in: ['nature', 'people'] } })
  .version('3.x')
  .limit(10)
  .find()
```
