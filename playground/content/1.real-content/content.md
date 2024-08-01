# Content API

Content server uses Nuxt storages to fetch contents.

Storages can define `content.sources` options inside `nuxt.config`.

By default **@nuxt/content** uses `content` directory at project root.

```ts
export default defineNuxtConfig({
  content: {
    sources: [
      'content', // Default directory
      'v2/content', // Additional source
      {
        // Checkout unstorage repository to learn more about drivers.
        // https://github.com/unjs/unstorage
        driver: 'fs' | 'http' | 'memory' | 'Resolved path for custom driver',
        driverOptions: {
          // Additional options for driver
        }
      }
    ]
  }
})
```

## Components

### `<ContentDoc>`

### `<ContentRenderer>`

> This component is used by `<ContentDoc>` under the hood.

Render any document content.

```vue [pages/[...slug\\].vue]
<script setup>
const route = useRoute()
const { data } = await useAsyncData(`doc-${route.path}`, () => queryContent(route.path).findOne())
</script>

<template>
  <ContentRenderer :value="data" />
</template>
```

### `<ContentRendererMarkdown>`

> This component is used by `<ContentRenderer>` under the hood.

Render a markdown content.

```vue
<template>
  <ContentRendererMarkdown :value="data" />
</template>
```

## Endpoints

- `/api/_content/highlight`

  Highlight a piece of code.

  ```ts
  $fetch('/api/_content/highlight', {
    method: 'POST',
    body: {
      code: `const contents = await queryContent('posts').where({ category: { $in: ['nature', 'people'] } }).limit(10).find()`,
      lang: 'js'
    }
  })
  // Return an array of tokens
  // [{ content: 'const', color: '#C678DD' }, ...]
  ```

## Parsers & Transformers

Parsers receive raw content of files and parse the content based on its extension.

Each content type can only have one parser.

Transformers receive parsed content and change it as they wish.

Parsers and Transformers can be defined using `defineContentPlugin`:

```ts
export default defineContentPlugin({
  name: 'plugin-name',
  extensions: ['.md'],
  parse: async (id, content) => {},
  transform: async content => {}
})
```

### Path Meta Transformer

Path-meta is a built-in transformer that extract multiple meta informations from file path.

- **Ordering**

**@nuxt/content** use special notation to order content. Adding `X.` as prefix to file/directory name will define content's order.

```
1.hello.md
2.index.md
3.group/1.index.md
```

- **Draft**

Is the file marked as `draft` or not.

Files with `.draft` suffix will be marked as draft.

- **path**

path for content based on its relative path on storage.

- **Title**

Title for the content generates based on content file name.

- **Page**

Whether file should mark as a standalone page or not.

Contents that starts with `_` will mark as non page contents.

They will not be treated as a page.
