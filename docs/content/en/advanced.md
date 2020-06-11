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

If you are using Nuxt 2.13+, `nuxt export` has a crawler feature integrated, so you may not need to use `generate.routes`.

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
This documentation use it actually, you can learn more by looking at [plugins/categories.js](https://github.com/nuxt/content/blob/master/docs/plugins/categories.js).

## Integration with @nuxtjs/feed

In the case of articles, the content can be used to generate news feeds
using [@nuxtjs/feed](https://github.com/nuxt-community/feed-module) module.

<base-alert type="info">

To use `$content` inside the `feed` option, you need to add `@nuxt/content` before `@nuxtjs/feed` in the `modules` property.

</base-alert>

**Example**

```js
export default {
  modules: [
    '@nuxt/content',
    '@nuxtjs/feed'
  ],

  feed () {
    const baseUrlArticles = 'https://mywebsite.com/articles'
    const baseLinkFeedArticles = '/feed/articles'
    const feedFormats = {
      rss: { type: 'rss2', file: 'rss.xml' },
      atom: { type: 'atom1', file: 'atom.xml' },
      json: { type: 'json1', file: 'feed.json' },
    }
    const { $content } = require('@nuxt/content')

    const createFeedArticles = async function (feed) {
      feed.options = {
        title: 'My Blog',
        description: 'I write about technology',
        link: baseUrlArticles,
      }
      const articles = await $content('articles').fetch()

      articles.forEach((article) => {
        const url = `${baseUrlArticles}/${article.slug}`

        feed.addItem({
          title: article.title,
          id: url,
          link: url,
          date: article.published,
          description: article.summary,
          content: article.summary,
          author: article.authors,
        })
      })
    }

    return Object.values(feedFormats).map(({ file, type }) => ({
      path: `${baseLinkFeedArticles}/${file}`,
      type: type,
      create: createFeedArticles,
    }))
  }
}
```
