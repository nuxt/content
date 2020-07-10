---
title: コンテンツを取得する
description: 'Nuxt.jsプロジェクトで$contentを使って静的コンテンツを取得する方法を紹介します。'
position: 4
category: 入門
---

`Content`はグローバルに `$content` インスタンスを注入するので、`this.$content` を使えばどこからでもアクセスできます。plugins、asyncData、fetch、nuxtServerInit、Middlewareは `context.$content` からアクセスできます。

## メソッド一覧

### $content(path, options?)

- `path`
  - Type: `String`
  - Default: `/`
- `options`
  - Type: `Object`
  - Default: `{}`
  - Version: **>= v1.3.0**
- `options.deep`
  - Type: `Boolean`
  - Default: `false`
  - Version: **>= v1.3.0**
  - *サブディレクトリからのファイルの取得*
- `options.text`
  - Type: `Boolean`
  - Default: `false`
  - Version: **>= v1.4.0**
  - *元のマークダウンの内容を`text`変数で返します*
- チェーンシーケンスを返します

> 引数を複数与えることもできます。`$content('article', params.slug)` は `/articles/${params.slug}` に変換されます。

`path`にはファイルかディレクトリを指定できます。`path`がファイルの場合、`fetch()` は `Object` を返し、ディレクトリの場合は `Array` を返します。

第二引数に `{ deep: true }` を渡すことでサブディレクトリからファイルを取得できます。

以下で紹介するメソッドはすべて`$content`の後につなげて使います。`Promise` を返す`fetch`以外は、チェーンシーケンスを返します。


### only(keys)

- `keys`
  - Type: `Array` | `String`
  - `required`

フィールドのサブセットを抽出します。

```js
const { title } = await this.$content('article-1').only(['title']).fetch()
```

### without(keys)

- `keys`
  - Type: `Array` | `String`
  - `required`

フィールドのサブセットを削除します。

```js
const { title, ...propsWithoutBody } = await this.$content('article-1').without(['body']).fetch()
```

### where(query)

- `query`
  - Type: `Object`
  - `required`

クエリで結果をフィルタリングします。

クエリはmongoクエリ構文のサブセットに基づいています。たとえば次のように処理します `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, ...

```js
// implicit (assumes $eq operator)
const articles = await this.$content('articles').where({ title: 'Home' }).fetch()
// explicit $eq
const articles = await this.$content('articles').where({ title: { $eq: 'Home' } }).fetch()

// $gt
const articles = await this.$content('articles').where({ age: { $gt: 18 } }).fetch()
// $in
const articles = await this.$content('articles').where({ name: { $in: ['odin', 'thor'] } }).fetch()
```

オブジェクトや配列でフィルタリングするには、`nestedProperties`を有効にする必要があります。[設定](/ja/configuration#nestedproperties)を参照してください。

```js
const products = await this.$content('products').where({ 'categories.slug': { $contains: 'top' } }).fetch()

const products = await this.$content('products').where({ 'categories.slug': { $contains: ['top', 'woman'] } }).fetch()
```

> 内部的にLokiJSを使用しています。[query examples](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries)をチェックしてください。

### sortBy(key, direction)

- `key`
  - Type: `String`
  - `required`
- `direction`
  - Type: `String`
  - Value: `'asc'` or `'desc'`
  - Default: `'asc'`

結果をkeyでソートします。

```js
const articles = await this.$content('articles').sortBy('title').fetch()
```

> 複数回チェインすることで、複数のフィールドでソートできます。

### limit(n)

- `n`
  - Type: `String` | `Number`
  - `required`

結果の数を最大でnまでに制限します。

```js
// fetch only 5 articles
const articles = await this.$content('articles').limit(5).fetch()
```

### skip(n)

- `n`
  - Type: `String` | `Number`
  - `required`

結果をnだけスキップします。

```js
// fetch the next 5 articles
const articles = await this.$content('articles').skip(5).limit(5).fetch()
```

### search(field, value)

- `field`
  - Type: `String`
  - `required`
- `value`
  - Type: `String`

フィールドの全文検索を行います。`value`はオプションで、この場合は `field` が `value` となり、定義したすべての全文検索フィールドに対して検索が行われます。

検索したいフィールドは、インデックスを作成するためにオプションで定義する必要があります。[設定](/ja/configuration#fulltextsearchfields)を参照してください。

```js
// Search on field title
const articles = await this.$content('articles').search('title', 'welcome').fetch()
// Search on all pre-defined fields
const articles = await this.$content('articles').search('welcome').fetch()
```

<base-alert type="info">

アプリに検索を実装する方法について[この実装例](/ja/examples#検索)を参考にしてください

</base-alert>

### surround(slug, options)

- `slug`
  - Type: `String`
  - `required`
- `options`
  - Type: `Object`
  - Default: `{ before: 1, after: 1}`

Get prev and next results arround a specific slug.

You will always obtain an array of fixed length filled with the maching document or `null`.

特定のスラッグを中心として、前の結果と次の結果を取得します。

ドキュメントか`null`が入った固定長の配列が戻り値になります。

```js
const [prev, next] = await this.$content('articles')
  .only(['title', 'path'])
  .sortBy('date')
  .where({ isArchived: false })
  .surround('article-2')
  .fetch()

// Returns
[
  {
    title: 'Article 1',
    path: 'article-1'
  },
  null // no article-3 here
]
```

> `surround`を利用する場合、`search`、`limit`、`skip`は考慮されません。

<base-alert type="info">

アプリに前後の記事へのリンクを実装する方法について[この実装例](/ja/examples#ページネーション)を参考にしてください

</base-alert>

### fetch()

- Returns: `Promise<Object>` | `Promise<Array>`

チェーンシーケンスを終了し、データを収集します。

## 用例

```js
const articles = await this.$content('articles')
  .only(['title', 'date', 'authors'])
  .sortBy('date', 'asc')
  .limit(5)
  .skip(10)
  .where({
    tags: 'testing',
    isArchived: false,
    date: { $gt: new Date(2020) },
    rating: { $gte: 3 }
  })
  .search('welcome')
  .fetch()
```

> 開発をスムーズにするために、[Content API](/ja/advanced#api-endpoint)の使い方をチェックしてください。
