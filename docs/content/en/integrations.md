---
title: Integrations
description: 'Learn how to use @nuxt/content with other modules.'
position: 11
category: Community
---

## @nuxtjs/feed

In the case of articles, the content can be used to generate news feeds
using [@nuxtjs/feed](https://github.com/nuxt-community/feed-module) module.

<base-alert type="info">

To use `$content` inside the `feed` option, you need to add `@nuxt/content` before `@nuxtjs/feed` in the `modules` property.

</base-alert>

**Example**

```js
export default {
  modules: [
    '@nuxt/content',
    '@nuxtjs/feed'
  ],

  feed () {
    const baseUrlArticles = 'https://mywebsite.com/articles'
    const baseLinkFeedArticles = '/feed/articles'
    const feedFormats = {
      rss: { type: 'rss2', file: 'rss.xml' },
      atom: { type: 'atom1', file: 'atom.xml' },
      json: { type: 'json1', file: 'feed.json' },
    }
    const { $content } = require('@nuxt/content')

    const createFeedArticles = async function (feed) {
      feed.options = {
        title: 'My Blog',
        description: 'I write about technology',
        link: baseUrlArticles,
      }
      const articles = await $content('articles').fetch()

      articles.forEach((article) => {
        const url = `${baseUrlArticles}/${article.slug}`

        feed.addItem({
          title: article.title,
          id: url,
          link: url,
          date: article.published,
          description: article.summary,
          content: article.summary,
          author: article.authors,
        })
      })
    }

    return Object.values(feedFormats).map(({ file, type }) => ({
      path: `${baseLinkFeedArticles}/${file}`,
      type: type,
      create: createFeedArticles,
    }))
  }
}
```
