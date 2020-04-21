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

## Programmatic usage

`$content` is accessible from **nuxtjs/content**.

**Example**

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