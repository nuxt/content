---
title: Интеграции
description: 'Изучите как использовать @nuxt/content с другими модулями.'
position: 13
category: Сообщество
---

## @nuxtjs/feed

С случае со статьями, контент может использоваться для генерации новостной ленты с использованием модуля [@nuxtjs/feed](https://github.com/nuxt-community/feed-module).

<alert type="info">

Для использования `$content` внутри параметра `feed`, вам нужно добавить `@nuxt/content` перед `@nuxtjs/feed` в `modules` вашего файла конфигурации.

</alert>

**Пример**

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
        title: 'Мой блог',
        description: 'Я пишу про технологии',
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
