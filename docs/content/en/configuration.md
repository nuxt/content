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

### `nestedProperties`

- Type `Array`
- Default: `[]`
- Version: **>= v1.3.0**

Register nested properties to handle dot-notation and deep filtering.

```js{}[nuxt.config.js]
content: {
  nestedProperties: ['categories.slug']
}
```

### `markdown`

This module uses [remark](https://github.com/remarkjs/remark) and [rehype](https://github.com/rehypejs/rehype) under the hood to compile markdown files into JSON AST that will be stored into the `body` variable.

<base-alert type="info">
The following explanation is valid for both `remarkPlugins` and `rehypePlugins`
</base-alert>

To configure how the module will parse Markdown, you can:

- Add a new plugin to the defaults:

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji']
    }
  }
}
```

- Override the default plugins:

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: () => ['remark-emoji']
    }
  }
}
```

- Use local plugins

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: [
        '~/plugins/my-custom-remark-plugin.js'
      ]
    }
  }
}
```

- Provide options directly in the definition

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: [
        ['remark-emoji', { emoticon: true }]
      ]
    }
  }
}
```

- Provide options using the name of the plugin in `camelCase`

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      // https://github.com/remarkjs/remark-external-links#options
      remarkExternalLinks: {
        target: '_self',
        rel: 'nofollow'
      }
    }
  }
}
```

<base-alert>
When adding a new plugin, make sure to install it in your dependencies:
</base-alert>

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add remark-emoji
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install remark-emoji
  ```

  </code-block>
</code-group>

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji']
    }
  }
}
```

### `markdown.remarkPlugins`

- Type: `Array`
- Default: `['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes']`
- Version: **>= v1.4.0**

> You can take a look at the list of [remark plugins](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins).

### `markdown.rehypePlugins`

- Type: `Array`
- Default: `['rehype-minify-whitespace', 'rehype-sort-attribute-values', 'rehype-sort-attributes', 'rehype-raw']`
- Version: **>= v1.4.0**

> You can take a look at the list of [rehype plugins](https://github.com/rehypejs/rehype/blob/master/doc/plugins.md#list-of-plugins).

### `markdown.basePlugins`

<base-alert>
Deprecated. Use `markdown.remarkPlugins` as a function instead.
</base-alert>

### `markdown.plugins`

<base-alert>
Deprecated. Use `markdown.remarkPlugins` as an array instead.
</base-alert>

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

This module uses `js-yaml` to parse `.yaml`, `.yml` files, you can check here for [options](https://github.com/nodeca/js-yaml#api).

Note that we force `json: true` option.


### `xml`

- Type: `Object`
- Default: `{}`

This module uses `xml2js` to parse `.xml` files, you can check here for [options](https://www.npmjs.com/package/xml2js#options).

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
    nestedProperties: [],
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
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {},
    xml: {}
  }
}
```
