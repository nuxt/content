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

## Merging defaults

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

### `liveEdit`

- Type `Boolean`
- Default: `true`
- Version: **>= v1.5.0**

Disable live edit mode in development:

```js{}[nuxt.config.js]
content: {
  liveEdit: false
}
```

### `markdown`

This module uses [remark](https://github.com/remarkjs/remark) and [rehype](https://github.com/rehypejs/rehype) under the hood to compile markdown files into JSON AST that will be stored into the `body` variable.

<alert type="info">

The following explanation is valid for both `remarkPlugins` and `rehypePlugins`

</alert>

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

<alert type="warning">

When adding a new plugin, make sure to install it in your dependencies:

</alert>

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

### `markdown.tocDepth`

- Type: `Number`
- Default: `3`
- Version: **>= v1.11.0**

You can change maximum heading depth to include in the table of contents.

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

<alert type="warning">

Deprecated. Use `markdown.remarkPlugins` as a function instead.

</alert>

### `markdown.plugins`

<alert type="warning">

Deprecated. Use `markdown.remarkPlugins` as an array instead.

</alert>

### `markdown.prism.theme`

- Type: `String`
- Default: `'prismjs/themes/prism.css'`

This module handles code highlighting in markdown content using [PrismJS](https://prismjs.com).

It automatically pushes the desired PrismJS theme in your Nuxt.js config, so if you want to use a different theme than the default one, for example [prism-themes](https://github.com/PrismJS/prism-themes):

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add prism-themes
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install prism-themes
  ```

  </code-block>
</code-group>

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

### `markdown.highlighter`

- Type: `Highlighter` | `PromisedHighlighter`
- Version: **>=1.9.0**

You can change the default code highlighter in markdown content by using this options. As an example, we use [highlight.js](https://highlightjs.org/).

```js{}[nuxt.config.js]
import highlightjs from 'highlight.js'

export default {
  content: {
    markdown: {
      highlighter(rawCode, lang) {
        const highlightedCode = highlightjs.highlight(lang, rawCode).value

        // We need to create a wrapper, because
        // the returned code from highlight.js
        // is only the highlighted code.
        return `<pre><code class="hljs ${lang}">${highlightedCode}</code></pre>`
      }
    }
  }
}
```

<alert type="info">

When `markdown.highlighter` is defined, it will automatically disable the inclusion of the Prism theme.

</alert>

<alert type="warning">

Don't forget to add the corresponding style manually if you define `markdown.highlighter`.

</alert>

It returns a `string` or [HAST](https://github.com/syntax-tree/hast) (Hypertext Abstract Syntax Tree). You can build HAST by passing the 4th argument. It consits of `h`, `node` and `u`.

```js{}[nuxt.config.js]
import highlightjs from 'highlight.js'

export default {
  content: {
    markdown: {
      highlighter(rawCode, lang, _, { h, node, u }) {
        const highlightedCode = highlightjs.highlight(lang, rawCode).value

        // We can use ast helper to create the wrapper
        const childs = []
        childs.push(
          h(node, 'pre', [
            h(node, 'code', { className: ['hljs', lang] }, [
              u('raw', highlightedCode)
            ])
          ])
        )

        return h(
          node,
          'div',
          { className: 'highlighted-with-highlightjs' },
          childs
        )
      }
    }
  }
}
```

After rendering with the `nuxt-content` component, it will look like this:

```html
<div class="highlighted-with-highlightjs">
  <pre class="language-<lang>">
    <code>
      ...
    </code>
  </pre>
</div>
```

You can also get the line highlight and file name value from the 3rd argument. Combining them with the HAST, you can pass it to the client.

```js{}[nuxt.config.js]
import highlightjs from 'highlight.js'

export default {
  content: {
    markdown: {
      highlighter(rawCode, lang, { lineHighlights, fileName }, { h, node, u }) {
        const highlightedCode = highlightjs.highlight(lang, rawCode).value

        const childs = []
        const props = {
          className: `language-${lang}`,
          dataLine: lineHighlights,
          dataFileName: fileName
        }
        childs.push(
          h(node, 'pre', [
            h(node, 'code', props, [
              u('raw', highlightedCode)
            ])
          ])
        )

        return h(
          node,
          'div',
          { className: 'highlighted-with-highlightjs' },
          childs
        )
      }
    }
  }
}
```

Then the returned code will look like this:

```html
<div class="highlighted-with-highlightjs">
  <pre class="language-<lang>" data-line="<line>" data-file-name="<file-name>">
    <code>
      ...
    </code>
  </pre>
</div>
```

> You can learn more about `h`, `node` and `u` from [mdast-util-to-hast](https://github.com/syntax-tree/mdast-util-to-hast), [Universal Syntax Tree](https://github.com/syntax-tree/unist#node) and [unist-builder](https://github.com/syntax-tree/unist-builder)

If you need to get the highlighter from promised-returned-package/function, you can do it this way:

```js{}[nuxt.config.js]
import { getHighlighter } from 'example-highlighter'

export default {
  content: {
    markdown: {
      async highlighter() {
        const highlighter = await getHighlighter()

        return (rawCode, lang) => {
          return highlighter.highlight(rawCode, lang)
        }
      }
    }
  }
}
```

> You can head over to [Snippets - Custom Highlighter](/snippets#custom-highlighter) section to see more example.

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

### `extendParser`

- Type: `Object`
- Default `{}`

With this option you can define your own parsers for other file types. Also you can **overwrite** the default parser!

To add your custom parser write a function that gets as an argument the content of the file and returns the extracted data.

**Example**

```js{}[nuxt.config.js]
const parseTxt = file => file.split('\n').map(line => line.trim())

// in Config:

{
  extendParser: {
    '.txt': parseTxt
  }
}
```

### `editor`

You can provide a custom editor for editing your markdown files in development. Set the `editor` option to a path to your editor component. The code of the default editor you can find [here](https://github.com/nuxt/content/blob/master/packages/content/templates/editor.vue).


```js{}[nuxt.config.js]
content: {
  editor: '~/path/to/editor/component.vue'
}
```

Your component should implement the following:

1. `v-model` for getting the markdown code.
2. prop `isEditing` is a boolean with the information if the editing is started and the component is shown. (this is optional)
3. when finished editing your component has to emit `endEdit`


You should be aware that you get the full markdown file content so this includes the front-matter. You can use `gray-matter` to split and join the markdown and the front-matter.


## Defaults

```js{}[nuxt.config.js]
export default {
  content: {
    editor: '~/.nuxt/content/editor.vue',
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug', 'text'],
    nestedProperties: [],
    liveEdit: true,
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
    xml: {},
    extendParser: {}
  }
}
```
