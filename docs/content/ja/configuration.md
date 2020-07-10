---
title: 設定
description: 'nuxt.config.jsのcontentプロパティで@nuxt/contentの設定ができます。'
category: 入門
position: 6
---

`nuxt.config.js`の`content`プロパティで`@nuxt/content`の設定ができます。

```js{}[nuxt.config.js]
export default {
  content: {
    // カスタム設定
  }
}
```

個々の設定項目を学ぶ前に、[デフォルトの設定](#デフォルトの設定)を確認してください。

### デフォルト値とのマージ

すべての設定のプロパティを関数または静的な値 (プリミティブ、オブジェクト、配列、...) として定義できます。  
関数で定義する場合、デフォルト値が第一引数として提供されます。

もしプロパティを定義するのに関数を使わない場合、設定されていない値はデフォルト値とマージします。
デフォルト値は非常に賢明なので、これは`markdown.remarkPlugins`、`markdown.rehypePlugins`などに便利です。
デフォルト値とのマージを回避したい場合、関数でのプロパティ定義を利用してください。

## プロパティ一覧

### `apiPrefix`

- Type: `String`
- Default: `'/_content'`

クライアントサイドのAPI呼び出しやSSE(Server-Sent Events)に利用されるルート

```js{}[nuxt.config.js]
content: {
  // $content api が localhost:3000/content-api で提供されます
  apiPrefix: 'content-api'
}
```

### `dir`

- Type: `String`
- Default: `'content'`

コンテンツを書くためのディレクトリ。絶対パスを指定できますが、相対パスの場合はNuxt [srcDir](https://nuxtjs.org/api/configuration-srcdir)で解決されます。

```js{}[nuxt.config.js]
content: {
  dir: 'my-content' //  my-content/ から contentを読み取ります
}
```

### `fullTextSearchFields`

- Type: `Array`
- Default: `['title', 'description', 'slug', 'text']`

全文検索を有効にするため、インデックス化する必要があるフィールド。検索についての詳細は[ここ](/ja/fetching#searchfield-value)を参照してください

`text`は、ASTにパースされる前のMarkdownを含む特別なキーです。

```js{}[nuxt.config.js]
content: {
  // title と description だけを検索
  fullTextSearchFields: ['title', 'description']
}
```

### `nestedProperties`

- Type `Array`
- Default: `[]`
- Version: **>= v1.3.0**

ドット表記やディープフィルタリングを処理するために、入れ子になったプロパティを登録します。

```js{}[nuxt.config.js]
content: {
  nestedProperties: ['categories.slug']
}
```

### `markdown`

[remark](https://github.com/remarkjs/remark)と[rehype](https://github.com/rehypejs/rehype)を使って、MarkdownファイルをJSON ASTにコンパイルし、変数`body`に格納します。

<base-alert type="info">
以下の説明は`remarkPlugins`と`rehypePlugins`の両方に当てはまります。
</base-alert>

どのようにMarkdownをパースするか設定するには、次のようにします。

- 新しいプラグインをデフォルトにする

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji']
    }
  }
}
```

- デフォルトプラグインのオーバーライド

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: () => ['remark-emoji']
    }
  }
}
```

- ローカルプラグインの利用

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: [
        '~/plugins/my-custom-remark-plugin.js'
      ]
    }
  }
}
```

- 定義の中で直接オプションを指定する

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: [
        ['remark-emoji', { emoticon: true }]
      ]
    }
  }
}
```

- `キャメルケース`でプラグインの名前を使ってオプションを指定する

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      // https://github.com/remarkjs/remark-external-links#options
      remarkExternalLinks: {
        target: '_self',
        rel: 'nofollow'
      }
    }
  }
}
```

<base-alert>
新しいプラグインを追加するときは、必ずdependenciesにインストールしてください
</base-alert>

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add remark-emoji
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install remark-emoji
  ```

  </code-block>
</code-group>

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji']
    }
  }
}
```

### `markdown.remarkPlugins`

- Type: `Array`
- Default: `['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes']`
- Version: **>= v1.4.0**

> [remark plugins](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins)を参照してください。

### `markdown.rehypePlugins`

- Type: `Array`
- Default: `['rehype-minify-whitespace', 'rehype-sort-attribute-values', 'rehype-sort-attributes', 'rehype-raw']`
- Version: **>= v1.4.0**

> [rehype plugins](https://github.com/rehypejs/rehype/blob/master/doc/plugins.md#list-of-plugins)を参照してください。

### `markdown.basePlugins`

<base-alert>
非推奨です。代わりに `markdown.remarkPlugins`を関数として使用してください。
</base-alert>

### `markdown.plugins`

<base-alert>
非推奨です。代わりに `markdown. remarkPlugins`を配列として使用してください。
</base-alert>

### `markdown.prism.theme`

- Type: `String`
- Default: `'prismjs/themes/prism.css'`

[PrismJS](https://prismjs.com)を使用してMarkdownコンテンツのコードのシンタックスハイライトを処理します。

これは、Nuxt.jsの設定で希望するPrismJSテーマを自動的にプッシュします。デフォルトのテーマとは異なるテーマを使用したい場合は、[prism-themes](https://github.com/PrismJS/prism-themes)から選んで変更します。

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add prism-themes
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install prism-themes
  ```

  </code-block>
</code-group>

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-material-oceanic.css'
    }
  }
}
```

テーマの組み込みを無効にしたい場合は、prismに`false`を設定します。:

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: false
    }
  }
}
```

### `yaml`

- Type: `Object`
- Default: `{}`

このモジュールは、`js-yaml`を使用して`.yaml`と`.yml`ファイルを解析します。ここで[options](https://github.com/nodeca/js-yaml#api)を確認できます。

`json：true`オプションを強制することに注意してください。 

### `xml`

- Type: `Object`
- Default: `{}`

このモジュールは `xml2js` を用いて `.xml` ファイルを解析します。[options](https://www.npmjs.com/package/xml2js#options)はこちらで確認できます。

### `csv`

- Type: `Object`
- Default: `{}`

このモジュールは、`node-csvtojson`を使用してcsvファイルを解析します。ここで[options](https://github.com/Keyang/node-csvtojson#parameters)を確認できます。


## デフォルトの設定

```js{}[nuxt.config.js]
export default {
  content: {
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug', 'text'],
    nestedProperties: [],
    markdown: {
      remarkPlugins: [
        'remark-squeeze-paragraphs',
        'remark-slug',
        'remark-autolink-headings',
        'remark-external-links',
        'remark-footnotes'
      ],
      rehypePlugins: [
        'rehype-minify-whitespace',
        'rehype-sort-attribute-values',
        'rehype-sort-attributes',
        'rehype-raw'
      ],
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {},
    xml: {}
  }
}
```
