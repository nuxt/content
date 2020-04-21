---
title: Advanced
position: 7
category: Getting started
---

## Hooks

The module adds some hooks you can use:

### `content:file:beforeInsert`

Allows you to add data to a document before it is stored.

**Example**

Taking the example of the blog starter, we use `file:beforeInsert` to add `readingTime` to a document using [reading-time](https://github.com/ngryman/reading-time).

```js
export default {
  modules: [,
    '@nuxtjs/content'
  ],
  hooks: {
    'content:file:beforeInsert': (document) => {
      const { time } = require('reading-time')(document.text)

      document.readingTime = time
    }
  }
}
```

### `content:file:beforeParsing`

Allows you to update the raw data of a file before it is parsed disregarding it's extension.

## Programmatic Usage

`$content` is accessible from **@nuxtjs/content**.

```js
export default {
  modules: [,
    '@nuxtjs/content'
  ],
  hooks: {
    async ready () {
      const { $content } = require('@nuxtjs/content')
      const files = await $content().fields(['slug']).fetch()
      console.log(files)
    }
  }
}
```

### Static Site Generation

When using `nuxt generate`, you need to specify the dynamic routes as stated [here](https://nuxtjs.org/api/configuration-generate/#routes), because Nuxt does not know what these routes will be so it can't generate them.

**Example**

```js
export default {
  modules: [,
    '@nuxtjs/content'
  ],
  generate: {
    async routes () {
      const { $content } = require('@nuxtjs/content')
      const files = await $content().fields(['path']).fetch()

      return files.map(file => file.path === '/index' ? '/' : file.path)
    }
  }
}
```