---
title: Advanced
description: 'Learn advanced usage of @nuxt/content module.'
position: 7
category: Getting started
---

## Programmatic Usage

`$content` is accessible from **@nuxt/content**.

<alert type="warning">

Beware that you can access it only **after the module has been loaded** by Nuxt. `require('@nuxt/content')` should happen in hooks or internal Nuxt methods.

</alert>

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

Since Nuxt 2.14+, `nuxt generate` has a crawler feature integrated which will crawl all your links and generate your routes based on those links. Therefore you do not need to do anything in order for your dynamic routes to be crawled.

Also, `nuxt generate` will automagically skip webpack build step when no code has been changed and use the previous build using cache. The content module integrates with this feature to ignore changes inside the `content/` folder. In other terms, when changing the content of your site and deploying, the build will be skipped.

> Learn more in [this article](https://nuxtjs.org/blog/nuxt-static-improvements).

When using Nuxt <= 2.12, you might need to specify the dynamic routes with [generate.routes](https://nuxtjs.org/api/configuration-generate/#routes)

**Example**

```js{}[nuxt.config.js]
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async routes () {
      const { $content } = require('@nuxt/content')
      const files = await $content({ deep: true }).only(['path']).fetch()

      return files.map(file => file.path === '/index' ? '/' : file.path)
    }
  }
}
```

<alert type="warning">

Recommended to use Nuxt 2.14+ with `nuxt generate` because it's awesome!

</alert>

## Hooks

The module adds some hooks you can use:

### `content:file:beforeParse`

Allows you to modify the contents of a file before it is handled by the parsers.

Arguments:
- `file`
 - Type: `Object`
 - Properties:
   - path: `String`
   - extension: `String` (ex: `.md`)
   - data: `String`

**Example**

Changing all appearances of `react` to `vue` in all Markdown files:

```js{}[nuxt.config.js]
hooks: {
  'content:file:beforeParse': (file) => {
    if (file.extension !== '.md') return
    file.data = file.data.replace(/react/g, 'vue')
  }
}
```

### `content:file:beforeInsert`

Allows you to add data to a document before it is stored.

Arguments:
- `document`
  - Type: `Object`
  - Properties:
    - See [writing content](/writing)

**Example**

When building a blog, you can use `file:beforeInsert` to add `readingTime` to a document using [reading-time](https://github.com/ngryman/reading-time).

> `text` is the body content of a markdown file before it is transformed to JSON AST, you can use at this point but it is not returned by the API.

```js{}[nuxt.config.js]
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

**Example**

You might want to parse markdown inside a `.json` file. You can access the parsers from the `database` object:

```js{}[nuxt.config.js]
export default {
  modules: [,
    '@nuxt/content'
  ],
  hooks: {
    'content:file:beforeInsert': async (document, database) => {
      if (document.extension === '.json' && document.body) {
        const data = await database.markdown.toJSON(document.body)

        Object.assign(document, data)
      }
    }
  }
}
```

### `content:options`

Extend the content options, useful for modules that wants to read content options when normalized and apply updated to it.

Arguments:
- `options`
  - Type: `Object`
  - Properties:
    - See [configuration](/configuration#properties)

**Example**

```js{}[nuxt.config.js]
export default {
  modules: [,
    '@nuxt/content'
  ],
  hooks: {
    'content:options': (options) => {
      console.log('Content options:', options)
    }
  }
}
```

## Handling Hot Reload

<alert type="info">

When you are in development mode, the module will automatically call `nuxtServerInit` store action (if defined) and `$nuxt.refresh()` to refresh the current page.

</alert>

In case you want to listen to the event to do something more, you can listen on `content:update` event on client-side using `$nuxt.$on('content:update')`:

```js{}[plugins/update.client.js]
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

**Example**

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
