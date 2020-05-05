---
title: Advanced
position: 7
category: Getting started
---

## Programmatic Usage

`$content` is accessible from **@nuxt/content**.

<base-alert>

  Beware that you can access it only **after the modules as been loaded** by Nuxt. `require('@nuxt/content')` should happens in hooks or internal Nuxt methods.

</base-alert>

```js
export default {
  modules: [,
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
