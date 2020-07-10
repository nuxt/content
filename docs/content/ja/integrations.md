---
title: 他のモジュールとの統合
description: '他のモジュールと@nuxt/contentの使い方をご紹介します。'
position: 11
category: Community
---

## @nuxtjs/feed

contentはニュースフィードを生成することもできます。
[@nuxtjs/feed](https://github.com/nuxt-community/feed-module)モジュールを使用してみましょう。

<base-alert type="info">

`feed`オプションの中で`$content`を使うには、`modules`で`@nuxtjs/feed`の前に`@nuxt/content`を追加する必要があります。

</base-alert>

**用例**

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
