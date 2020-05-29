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

Before diving into the individual attributes, please have a look [at the default settings](#defaults) of the module.

### Merging defaults

You can define every option either as function or as static value (primitives, objects, arrays, ...).
if you use a function, the default value will be provided as the first argument.

If you *don't* use a function to define you properties, the module will try to
merge them with the default values. This can be handy for `markdown.remarkPlugins`, `markdown.rehypePlugins` and so on because
the defaults are quite sensible. If you don't want to have the defaults include, just use a function.

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

### `markdown`

This module uses [remark](https://github.com/remarkjs/remark) under the hood to compile markdown files into JSON AST that will be stored into the `body` variable.

By default, this module uses plugins to improve markdown parsing. Each plugin is configured using its name in camelCase: `remark-external-links` => `remarkExternalLinks`.

> You check for remark plugins [here](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins)

### `markdown.basePlugins`

<base-alert>**Deprecated**</base-alert>

### `markdown.plugins`

<base-alert>**Deprecated** => `markdown.remarkPlugins`</base-alert>

### `markdown.remarkPlugins`

- Type: `Array`
- Default: `['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes']`
- Version: **v2.0.0**

### `markdown.rehypePlugins`

- Type: `Array`
- Default: `['rehype-minify-whitespace', 'rehype-sort-attribute-values', 'rehype-sort-attributes', 'rehype-raw']`
- Version: **v2.0.0**

### `markdown.externalLinks`

<base-alert>**Deprecated** => `markdown.remarkExternalLinks`</base-alert>

### `markdown.remarkExternalLinks`

- Type: `Object`
- Default: `{}`
- Version: **v2.0.0**

You can control the behaviour of links via this option. You can check here for [options](https://github.com/remarkjs/remark-external-links#api).

```js{}[nuxt.config.js]
content: {
  markdown: {
    remarkExternalLinks: {
      target: '_self' // disable target="_blank"
      rel: false // disable rel="nofollow noopener"
    }
  }
}
```

### `markdown.footnotes`

<base-alert>**Deprecated** => `markdown.remarkFootnotes`</base-alert>

### `markdown.remarkFootnotes`

- Type: `Object`
- Default: `{ inlineNotes: true }`
- Version: **v2.0.0**

You can control the behaviour of footnotes via this option. You can check here for [options](https://github.com/remarkjs/remark-footnotes#remarkusefootnotes-options).

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

This module uses `js-yaml` to parse yaml files, you can check here for [options](https://github.com/nodeca/js-yaml#api).

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
      remarkPlugins: [
        'remark-squeeze-paragraphs',
        'remark-slug',
        'remark-autolink-headings',
        'remark-external-links',
        'remark-footnotes'
      ],
      rehypePlugins: [
        'rehype-minify-whitespace',
        'rehype-sort-attribute-values',
        'rehype-sort-attributes',
        'rehype-raw'
      ],
      remarkExternalLinks: {},
      remarkFootnotes: {
        inlineNotes: true
      },
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {}
  }
}
```
