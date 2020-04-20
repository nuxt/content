---
title: Fetching content
position: 4
category: Getting started
---

The module automatically injects **$content** inside your Nuxt.js application, so you can access it inside your pages:

```js
export default {
  async asyncData ({ $content }) {
    const articles = await $content('articles').fetch()

    return {
      articles
    }
  },
  methods: {
    async search () {
      await this.$content('articles').search('content')
    }
  }
}
```

## .fields()

## .where()

## .sortBy()

## .limit()

## .skip()

## .search()

## .surround()

## .fetch()
