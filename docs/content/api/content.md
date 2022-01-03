# Content API

- Content server uses Nuxt storages to fetch contents. Storages can define under `docus.sources` option inside `nuxt.config`. By default Docus uses `content` directory project root.

  ```ts
  export default defineNuxtConfig({
    docus: {
      sources: [
        'content', // Default directory
        'v2/content', // Additional source
        {
          // Checkout unstorage repository to learn more about drivers. https://github.com/unjs/unstorage
          driver: 'fs' | 'http' | 'memory' | 'Resolved path for custom driver',
          driverOptions: {
            // Additional options for driver
          }
        }
      ]
    }
  })
  ```

- Content server expose two API
  - `/api/_docus/list`: List available contents in all sources.
  - `/api/_docus/get/:id`: Fetch specific content using content id. (Ids can retrive from list API)

- Docus provide some composables two work with content server:
  - `getContentList`: Fetch contents list from server and return as simple array.
  - `useContentList`: Fetch contents list from server and return a reactive array. The result automatically updates every time a content changes.
  - `getContent(:id)`: Fetch meta and body of specific content.
  - `useContent(:id)`: Fetch meta and body of specific content. Result will update everytime the content changes.

- Docus provides custom hook `content:update` to notify content changes.
  ```ts
  nuxtApp.hook('content:update', ({ event, key }) => {
    // ...
  })
  ```