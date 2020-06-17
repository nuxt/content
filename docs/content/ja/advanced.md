---
title: 発展的な機能
description: '@nuxt/contentの発展的な利用方法を学ぶ'
position: 7
category: 入門
---

## プログラマティックな利用方法

`$content`は **@nuxt/content**からアクセスできます

<base-alert>

  **モジュールがNuxtによってロードされた後**でなければアクセスできないことに注意してください。`require('@nuxt/content')` は、フックや内部のNuxtメソッドで発生するはずです。

</base-alert>

```js
export default {
  modules: [
    '@nuxt/content'
  ],
  generate: {
    async ready () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['slug']).fetch()
      console.log(files)
    }
  }
}
```

### 静的サイト生成

<base-alert type="info">

Nuxt 2.13+を使用している場合、`nuxt export`にはクローラー機能が統合されているので、`generate.routes`を使用する必要はないかもしれません。

</base-alert>

`nuxt generate` を利用する場合は、[`generate.routes`](https://nuxtjs.org/api/configuration-generate/#routes) で動的ルートを指定する必要があります。
なぜなら、Nuxtはこれらのルートが何になるかわからないので、ルートを生成できないからです。

**例**

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async routes () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['path']).fetch()

      return files.map(file => file.path === '/index' ? '/' : file.path)
    }
  }
}
```

## フック

いくつかのフックを提供します。

### `content:file:beforeInsert`

保存する前にドキュメントへデータを追加できます。

Arguments:
- `document`
  - Type: `Object`
  - Properties:
    - [コンテンツを作成する](/ja/writing)を参照してください。


**例**

ブログのスターターを例にとると、[reading-Time](https://github.com/ngryman/reading-time)を利用した`readingTime` をドキュメントへ追加するために、`file:beforeInsert`を使うことができます。

> `text`は、JSON ASTに変換される前のMarkdownファイルのbodyの内容で、この時点では使用できますが、APIからは返されません。

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        const { time } = require('reading-time')(document.text)

        document.readingTime = time
      }
    }
  }
}
```

## ホットリロードの取り扱い

<base-alert type="info">

開発モードの場合、モジュールは自動的に `nuxtServerInit` ストアアクション (定義されている場合) と `$nuxt.refresh()` を呼び出して現在のページを更新します。

</base-alert>

イベントを待ち受けてさらに何かをしたい場合は、`$nuxt.$on('content:update')`を使ってクライアント側で `content:update` イベントを待ち受けることができます。

```js{}[plugins/update.client.js
export default function ({ store }) {
  // 開発時のみ
  if (process.dev) {
    window.onNuxtReady(($nuxt) => {
      $nuxt.$on('content:update', ({ event, path }) => {
        // storeのカテゴリを更新
        store.dispatch('fetchCategories')
      })
    })
  }
}
```

`nuxt.config.js`にプラグインを追加します。

```js{}[nuxt.config.js]
export default {
  plugins: [
    '@/plugins/update.client.js'
  ]
}
```

これで、`content/`ディレクトリ内のファイルを更新するたびに、`fetchCategories`メソッドもディスパッチされます。
このドキュメントサイトでは実際にそれを使用しています。[plugins/categories.js](https://github.com/nuxt/content/blob/master/docs/plugins/categories.js)を見れば、より多くのことを学ぶことができます。

## @nuxtjs/feed との統合

contentはニュースフィードを生成できます。  
[@nuxtjs/feed](https://github.com/nuxt-community/feed-module)モジュールを使用します。

<base-alert type="info">

`feed` オプションの中で `$content` を使うには、`modules`で `@nuxtjs/feed` の前に `@nuxt/content` を追加する必要があります。

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
