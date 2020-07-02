---
title: Advanced
description: 'Learn advanced usage of @nuxt/content module.'
position: 7
category: Getting started
---

## Programmatic Usage

`$content` is accessible from **@nuxt/content**.

<base-alert>

  Beware that you can access it only **after the module has been loaded** by Nuxt. `require('@nuxt/content')` should happen in hooks or internal Nuxt methods.

</base-alert>

```js
export default {
  modules: [
    '@nuxt/content'
  ],
  generate: {
    async ready () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['slug']).fetch()
      console.log(files)
    }
  }
}
```

### Static Site Generation

<base-alert type="info">

Since Nuxt 2.13+, `nuxt export` has a crawler feature integrated which will crawl all your links and generate your routes based on those links. Therefore you do not need to do anything in order for your dynamic routes to be crawled.

</base-alert>

When using `nuxt generate`, you need to specify the dynamic routes with [`generate.routes`](https://nuxtjs.org/api/configuration-generate/#routes), because Nuxt does not know what these routes will be so it can't generate them.

**Example**

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async routes () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['path']).fetch()

      return files.map(file => file.path === '/index' ? '/' : file.path)
    }
  }
}
```

## Hooks

The module adds some hooks you can use:

### `content:file:beforeInsert`

Allows you to add data to a document before it is stored.

Arguments:
- `document`
  - Type: `Object`
  - Properties:
    - See [writing content](/writing)


**Example**

Taking the example of the blog starter, we use `file:beforeInsert` to add `readingTime` to a document using [reading-time](https://github.com/ngryman/reading-time).

> `text` is the body content of a markdown file before it is transformed to JSON AST, you can use at this point but it is not returned by the API.

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        const { time } = require('reading-time')(document.text)

        document.readingTime = time
      }
    }
  }
}
```

## Handling Hot Reload

<base-alert type="info">

When you are in development mode, the module will automatically call `nuxtServerInit` store action (if defined) and `$nuxt.refresh()` to refresh the current page.

</base-alert>

In case you want to listen to the event to do something more, you can listen on `content:update` event on client-side using `$nuxt.$on('content:update')`:

```js{}[plugins/update.client.js
export default function ({ store }) {
  // Only in development
  if (process.dev) {
    window.onNuxtReady(($nuxt) => {
      $nuxt.$on('content:update', ({ event, path }) => {
        // Refresh the store categories
        store.dispatch('fetchCategories')
      })
    })
  }
}
```

And then add your plugin in your `nuxt.config.js`:

```js{}[nuxt.config.js]
export default {
  plugins: [
    '@/plugins/update.client.js'
  ]
}
```

Now everytime you will update a file in your `content/` directory, it will also dispatch the `fetchCategories` method.
This documentation use it actually, you can learn more by looking at [plugins/init.js](https://github.com/nuxt/content/blob/master/docs/plugins/init.js).

## API Endpoint


This module exposes an API endpoint in development so you can easily see the JSON of each directory or file, it is available on [http://localhost:3000/_content/](http://localhost:3000/_content/). The prefix is `_content` by default and can be configured with the [apiPrefix](/configuration#apiprefix) property.

Example:

```bash
-| content/
---| articles/
------| hello-world.md
---| index.md
---| settings.json
```

Will expose on `localhost:3000`:
- `/_content/articles`: list the files in `content/articles/`
- `/_content/articles/hello-world`: get `hello-world.md` as JSON
- `/_content/index`: get `index.md` as JSON
- `/_content/settings`: get `settings.json` as JSON
- `/_content`: list `index` and `settings`

The endpoint is accessible on `GET` and `POST` request, so you can use query params: [http://localhost:3000/_content/articles?only=title&only=description&limit=10](http://localhost:3000/_content/articles?only=title&only=description&limit=10).

Since **v1.4.0**, this endpoint also support `where` in query params:

- All the keys that doesn't belong to any of the default ones will be applied to `where`

`http://localhost:3000/_content/articles?author=...`

- You can use `$operators` with `_`:

`http://localhost:3000/_content/articles?author_regex=...`

> This module uses LokiJS under the hood, you can check for [query examples](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

- You can use [nested properties](/configuration#nestedproperties):

`http://localhost:3000/_content/products?categories.slug_contains=top`

> You can learn more about that endpoint in [lib/middleware.js](https://github.com/nuxt/content/blob/master/lib/middleware.js).
