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

Nuxt 2.13+ 以降、`nuxt export` にはクローラー機能が統合されており、すべてのリンクをクロールし、それらのリンクに基づいてルートを生成します。したがって、動的なルートをクロールさせるためには何もする必要はありません。

</base-alert>

`nuxt generate` を利用する場合は、[generate.routes](https://nuxtjs.org/api/configuration-generate/#routes) で動的ルートを指定する必要があります。
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

開発モードの場合、モジュールは自動的に `nuxtServerInit`ストアアクション （定義されている場合）と `$nuxt.refresh()` を呼び出して現在のページを更新します。

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
このドキュメントサイトでは実際にそれを使用しています。[plugins/init.js](https://github.com/nuxt/content/blob/master/docs/plugins/init.js)を見れば、より多くのことを学ぶことができます。

## APIエンドポイント

このモジュールは開発中のAPIエンドポイントを公開し、各ディレクトリやファイルのJSONを簡単に見ることができるようにします。[http://localhost:3000/_content/](http://localhost:3000/_content/)で利用可能です。プレフィックスはデフォルトでは `_content`で、[apiPrefix](ja/configuration#apiprefix)プロパティで設定できます。

例：

```bash
-| content/
---| articles/
------| hello-world.md
---| index.md
---| settings.json
```

`localhost:3000`で公開されます:
- `/_content/articles`: `content/articles/`のファイルのリスト
- `/_content/articles/hello-world`: `hello-world.md` をJSONで取得
- `/_content/index`: `index.md` をJSONで取得
- `/_content/settings`:`settings.json` をJSONで取得
- `/_content`: `index` と `settings`のリスト


 エンドポイントは `GET` や `POST` リクエストでアクセスできるので、クエリのパラメーターを利用できます。: [http://localhost:3000/_content/articles?only=title&only=description&limit=10](http://localhost:3000/_content/articles?only=title&only=description&limit=10).

**v1.4.0**以降、このエンドポイントはクエリパラメータの `where`もサポートしています。

- デフォルトのキーに属さないすべてのキーが `where`に適用されます。

`http://localhost:3000/_content/articles?author=...`

- `$operators`は`_`と一緒に使うことができます。

`http://localhost:3000/_content/articles?author_regex=...`

> このモジュールは 、内部的にLokiJSを使用しています。、あなたは[クエリの例]（https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries）をチェックすることができます。

- [nested properties](/ja/configuration#nestedproperties)も利用できます

`http://localhost:3000/_content/products?categories.slug_contains=top`

> このエンドポイントについての詳細は [lib/middleware.js](https://github.com/nuxt/content/blob/master/lib/middleware.js)を参照してください。
