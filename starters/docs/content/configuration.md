---
title: Configuration
category: Getting started
position: 6
---

```js
// nuxt.config.js
export default {
  modules: ['@nuxtjs/content'],
  // Default options
  content: {
    apiPrefix: '_content', // http://localhost:3000/_content,
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug'],
    markdown: {
      // See https://github.com/remarkjs/remark-external-links#api
      externalLinks: {},
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {
      // See https://github.com/nodeca/js-yaml
    },
    csv: {
      // See https://github.com/Keyang/node-csvtojson
    }
  }
}
```