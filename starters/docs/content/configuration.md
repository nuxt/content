---
title: Configuration
category: Getting started
position: 6
---

## Properties

### `apiPrefix`

Route that will be used for client-side API calls and SSE. Defaults to `/_content`.

### `dir`

Directory used for writing content. Defaults to `content`.

### `fullTextSearchFields`

Fields that needs to be indexed to be searchable. Defaults to `['title', 'description', 'slug']`.

### `markdown.externalLinks`

This module uses `remark` under the hood to compile markdown files. You can control the behaviour of links via this option. You can check here for [options](https://github.com/remarkjs/remark-external-links#api).

### `markdown.prism.theme`

This module handles code highlighting in markdown content using [PrismJS](https://prismjs.com).

It automatically pushes the desired PrismJS theme in your Nuxt.js config, so if you want to use a different theme than the default one, for example [prism-themes](https://github.com/PrismJS/prism-themes):

```js
markdown: {
  prism: {
    theme: 'prism-themes/themes/prism-material-oceanic.css'
  }
}
```

Defaults to `prismjs/themes/prism.css`.

### `yaml`

This module uses `js-yaml` to parse csv files, you can check here for [options](https://github.com/nodeca/js-yaml#api).

### `csv`

This module uses `node-csvtojson` to parse csv files, you can check here for [options](https://github.com/Keyang/node-csvtojson#parameters).

## Example

```js{}[nuxt.config.js]
export default {
  modules: ['@nuxtjs/content'],
  content: {
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug'],
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