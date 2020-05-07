---
title: Configuration
description: 'You can configure @nuxt/content with the content property in your nuxt.config.js.'
category: Getting started
position: 6
---

You can configure `@nuxt/content` with the `content` property in your `nuxt.config.js`.

```js{}[nuxt.config.js]
export default {
  content: {
    // My custom configuration
  }
}
```

See [defaults options](#defaults).

## Properties

### `apiPrefix`

- Type: `String`
- Default: `'/_content'`

Route that will be used for client-side API calls and SSE.

```js{}[nuxt.config.js]
content: {
  // $content api will be served on localhost:3000/content-api
  apiPrefix: 'content-api'
}
```

### `dir`

- Type: `String`
- Default: `'content'`

Directory used for writing content.
You can give an absolute path, if relative, it will be resolved with Nuxt [srcDir](https://nuxtjs.org/api/configuration-srcdir).

```js{}[nuxt.config.js]
content: {
  dir: 'my-content' // read content from my-content/
}
```

### `fullTextSearchFields`

- Type: `Array`
- Default: `['title', 'description', 'slug', 'text']`

Fields that needs to be indexed to be searchable, learn more about search [here](/fetching#searchfield-value).

`text` is a special key that contains your Markdown before being parsed to AST.

```js{}[nuxt.config.js]
content: {
  // Only search in title and description
  fullTextSearchFields: ['title', 'description']
}
```

### `markdown.externalLinks`

- Type: `Object`
- Default: `{}`

This module uses `remark` under the hood to compile markdown files. You can control the behaviour of links via this option. You can check here for [options](https://github.com/remarkjs/remark-external-links#api).

```js{}[nuxt.config.js]
content: {
  markdown: {
    externalLinks: {
      target: '_self' // disable target="_blank"
      rel: false // disable rel="nofollow noopener"
    }
  }
}
```

### `markdown.prism.theme`

- Type: `String`
- Default: `'prismjs/themes/prism.css'`

This module handles code highlighting in markdown content using [PrismJS](https://prismjs.com).

It automatically pushes the desired PrismJS theme in your Nuxt.js config, so if you want to use a different theme than the default one, for example [prism-themes](https://github.com/PrismJS/prism-themes):

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-material-oceanic.css'
    }
  }
}
```

To disable the inclusion of the theme, set prism to `false`:

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: false
    }
  }
}
```

### `yaml`

- Type: `Object`
- Default: `{}`

This module uses `js-yaml` to parse csv files, you can check here for [options](https://github.com/nodeca/js-yaml#api).

Note that we force `json: true` option.

### `csv`

- Type: `Object`
- Default: `{}`

This module uses `node-csvtojson` to parse csv files, you can check here for [options](https://github.com/Keyang/node-csvtojson#parameters).

## Defaults

```js{}[nuxt.config.js]
export default {
  content: {
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug', 'text'],
    markdown: {
      externalLinks: {},
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {}
  }
}
```
