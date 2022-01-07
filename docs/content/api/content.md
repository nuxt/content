# Content API

Content server uses Nuxt storages to fetch contents.

Storages can define `docus.sources` options inside `nuxt.config`.

By default Docus uses `content` directory at project root.

```ts
export default defineNuxtConfig({
  docus: {
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

## Endpoints

Content server exposes two APIs:

- `/api/_docus/list`
  
  List available contents in all sources.

- `/api/_docus/get/:id`

  Fetch specific content using content id. (Ids can retrive from list API)

## Composables

Docus provide composables to work with content server:

- `getContentList`
  
  Fetch contents list from server and return as simple array.
  
- `useContentList`
  
  Fetch contents list from server and return a reactive array. The result automatically updates every time a content changes.
  
- `getContent(:id)`
  
  Fetch meta and body of specific content.
  
- `useContent(:id)`
  
  Fetch meta and body of specific content. Result will update everytime the content changes.

## Hooks

Docus also provides the `content:update` hook notified on content changes.
  
```ts
nuxtApp.hook('content:update', ({ event, key }) => {
  // ...
})
```

## Parsers & Transformers

Parsers receive raw content of files and parse the content based on its extension.

Each content type can only have one parser.

Transformers receive parsed content and change it as they wish.

Parsers and Transformers can be defined using `defineContentPlugin`:

```ts
export default defineContentPlugin({
  name: 'plugin-name',
  extentions: ['.md'],
  parse: async (id, content) => {
  },
  transform: async (content) => {
  }
})
```

### Path Meta Transformer

Path-meta is a built-in transformer that extract multiple meta informations from file path.

- **Ordering**

Docus use special notation to order content. Adding `X.` as prefix to file/directory name will define content's order.

```any
1.hello.md
2.index.md
3.group/1.index.md
```

- **Draft**

Is the file marked as `draft` or not.

Files with `.draft` suffix will be marked as draft.

- **Slug**

Slug for content based on its relative path on storage.

- **Title**

Title for the content generates based on content file name.

- **Page**

Whether file should mark as a standalone page or not.

Contents that starts with `_` will mark as non page contents.

They will not be treated as a page.
