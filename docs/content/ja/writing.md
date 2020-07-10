---
title: コンテンツを作成する
description: 'Markdown、YAML、CSV、JSONに対応したcontent/内の書き方を学びます。'
position: 3
category: 入門
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

まず、プロジェクト内に `content/` ディレクトリを作成します。

```bash
content/
  articles/
    article-1.md
    article-2.md
  home.md
```

このモジュールは `.md`, `.yaml`, `.yml`, `.csv`, `.json`, `.json5`, `.xml` ファイルを解析し、以下のプロパティを生成します。

- `dir`
- `path`
- `slug`
- `extension` (ex: `.md`)
- `createdAt`
- `updatedAt`

## Markdown

このモジュールは `.md` ファイルを変数`body`へ格納されたJSON ASTツリー構造体に変換します。

Markdownコンテンツの `body` を表示するために `<nuxt-content>` コンポーネントを必ず使用してください。[コンテンツを表示する](/displaying)を参照してください。

> Markdownをマスターするには、[basic syntax guide](https://www.markdownguide.org/basic-syntax)を参照してください。

### フロントマター

マークダウンファイルにYAMLフロントマターブロックを追加できます。フロントマターはファイルの最初でなければならず、`---`の間に有効なYAMLの形式を取らなければなりません。ここに基本的な例を示します。

```md
---
title: Introduction
description: Learn how to use @nuxt/content.
---
```

これらの変数はドキュメント内に注入されます。

```json
{
  body: Object
  title: "Introduction"
  description: "Learn how to use @nuxt/content."
  dir: "/"
  extension: ".md"
  path: "/index"
  slug: "index"
  toc: Array
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 見出し

このモジュールは自動的に`id`と`link`を各見出しに追加します。

次のようなMarkdownファイルがあるとします。

```md[home.md]
# Lorem ipsum
## dolor—sit—amet
### consectetur &amp; adipisicing
#### elit
##### elit
```

これらはJSON ASTに変換され、`nuxt-content`コンポーネントを使用することで、HTMLのようにレンダリングされます。

```html
<h1 id="lorem-ipsum-"><a href="#lorem-ipsum-" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>Lorem ipsum</h1>
<h2 id="dolorsitamet"><a href="#dolorsitamet" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>dolor—sit—amet</h2>
<h3 id="consectetur--adipisicing"><a href="#consectetur--adipisicing" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>consectetur &#x26; adipisicing</h3>
<h4 id="elit"><a href="#elit" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h4>
<h5 id="elit-1"><a href="#elit-1" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h5>
```

> 見出しのリンクは空なので非表示になっています。好きにスタイルを変更できます。たとえば、このドキュメントのヘッダの一つにカーソルを合わせてみてください。

### リンク

リンクは、[remark-external-links](https://github.com/remarkjs/remark-external-links) を使って、有効な `target` 属性と `rel` 属性を追加するように変換されます。このプラグインの設定方法については、[ここ](/ja/configuration#markdown)を参照してください。

また、相対リンクは自動的に [nuxt-link](https://nuxtjs.org/api/components-nuxt-link/) に変換されます。これはスマートな事前読込みによって、パフォーマンスを向上させたページコンポーネント間のナビゲーションを提供します。

ここでは、相対リンク、HTMLリンク、markdownリンク、外部リンクを使用した例を示します。

```md
---
title: Home
---

## Links

<nuxt-link to="/articles">Nuxt Link to Blog</nuxt-link>

<a href="/articles">Html Link to Blog</a>

[Markdown Link to Blog](/articles)

<a href="https://nuxtjs.org">External link html</a>

[External Link markdown](https://nuxtjs.org)
```

### 脚注

このモジュールは、[remark-footnotes](https://github.com/remarkjs/remark-footnotes)を使った脚注のための拡張Markdown構文をサポートしています。このプラグインの設定方法については、[ここ](/ja/configuration#markdown)をチェックしてください。

以下は脚注を使用した例です。

```md
Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.
```

> さらに詳しく知りたいなら、 [extended syntax guide](https://www.markdownguide.org/extended-syntax/#footnotes)を参照してください。

### コードブロック

このモジュールはコードブロックを自動的にラップし、[PrismJS](https://prismjs.com)クラスを適用します（[シンタックスハイライト](#シンタックスハイライト)参照）。

Markdownのコードブロックは、` ``` `の内側にラップされます。オプションで、特定のシンタックスハイライトを有効にし、コードブロックの言語を指定できます。

基本的に、Markdownはファイル名やコードブロック内の特定の行のハイライトをサポートしていません。しかし、このモジュールは独自のカスタム構文でそれを可能にします。

- 中括弧内のハイライトしたい行番号を書く
- 角括弧内にファイル名を書く

<pre class="language-js">
```js{1,3-5}[server.js]
const http = require('http')
const bodyParser = require('body-parser')

http.createServer((req, res) => {
  bodyParser.parse(req, (error, body) => {
    res.end(body)
  })
}).listen(3000)
```
</pre>

`nuxt-content` コンポーネントでレンダリングすると、以下のようになります。

```html[server.js]
<div class="nuxt-content-highlight">
  <span class="filename">server.js</span>
  <pre class="language-js" data-line="1,3-5">
    <code>
      ...
    </code>
  </pre>
</div>
```

> 行番号は`pre`タグの`data-line`属性に追加されます。

> ファイル名は `filename` クラスを持つspanに変換されます。このスタイルはあなた次第です。コードブロックの右上にあるドキュメントを見てください。

### シンタックスハイライト

[PrismJS](https://prismjs.com)を使用したデフォルトのコードハイライトをサポートし、オプションで定義されたテーマをNuxt.jsアプリに注入します（[設定](/ja/configuration#markdownprismtheme)を参照）。

### HTML

MarkdownにHTMLを書くこともできます:

```md[home.md]
---
title: Home
---

## HTML

<p><span class="note">A mix of <em>Markdown</em> and <em>HTML</em>.</span></p>
```

コンポーネントの中にMarkdownを配置する場合、その前に空の行を続けて配置しなければならないことに注意してください。そうでない場合は、ブロック全体がカスタムHTMLとして扱われます。

**ダメな例:**

```html
<div class="note">
  *Markdown* and <em>HTML</em>.
</div>
```

**良い例:**

```html
<div class="note">

  *Markdown* and <em>HTML</em>.

</div>
```

**このようになります**:

```html
<span class="note">*Markdown* and <em>HTML</em>.</span>
```

### Vueコンポーネント

グローバルVueコンポーネントを使用することも、Markdownを表示しているページにローカルに登録されたコンポーネントを使用することもできます。

`nuxt/content`はすべてのMarkdownが著者によって提供される(サードパーティのユーザー投稿ではなく)という前提で動作するので、ソースは完全に(タグを含む)処理されます。この仕様に関して、[rehype-raw](https://github.com/rehypejs/rehype-raw)からいくつかの注意点があります。

1. コンポーネントはケバブケースで参照する必要があります。

```html
Use <my-component> instead of <MyComponent>
```

2. セルフクローズタグは使えません。以下は **動作しません**：

```html
<my-component/>
```

以下は **動作します**：

```html
<my-component></my-component>
```

**実例：**

[ExampleMultiselect.vue](https://github.com/nuxt/content/blob/master/docs/components/examples/ExampleMultiselect.vue)というVueコンポーネントがあるとします:

```md[home.md]
Please choose a *framework*:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>
```

**Result:**

<div class="border rounded p-2 mb-2 bg-gray-200 dark:bg-gray-800">

Please choose a *framework*:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>

</div>

また、フロントマターでコンポーネントのオプションを定義することもできます。

```md[home.md]
---
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

<example-multiselect :options="multiselectOptions"></example-multiselect>
```

<example-multiselect :options="multiselectOptions"></example-multiselect><br>

<base-alert type="info">

これらのコンポーネントは `<nuxt-content>` コンポーネントを使ってレンダリングされます。[コンテンツを表示する](/ja/displaying#component)を参照してください。

</base-alert>

また Markdownの中で`<template>` タグを***使用できない***ことにも注意してください　(例: `v-slot` と使用する)

#### グローバルコンポーネント

**v1.4.0** と **v2.13.0** から、コンポーネントを `components/global/` ディレクトリに置くことができるようになり、ページ内でコンポーネントをインポートする必要がなくなりました。

```bash
components/
  global/
    Hello.vue
content/
  home.md
```

これだけで、`content/home.md`の中で`<hello></hello>`コンポーネントを使用できます。インポートし忘れることはありません。

### 目次

ドキュメントを取得する際には、すべてのタイトルの配列である tocプロパティにアクセスできます。それぞれのタイトルにはリンクが可能なように `id` があり、見出しの種類である深さが設定されています。tocにはh2とh3のタイトルのみが使われます。タイトルのテキストであるtextプロパティもあります。

```json
{
  "toc": [{
    "id": "welcome",
    "depth": 2,
    "text": "Welcome!"
  }]
}
```

> このページの右側に表示されている目次を例に見てみましょう。

<base-alert type="info">

アプリに目次を実装する方法について、[この実装例](/ja/examples#目次)を参照してください

</base-alert>

### 用例

`content/home.md`ファイル:

```md
---
title: Home
---

## Welcome!
```

以下のように変換されます。

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".md",
  "title": "Home",
  "toc": [
    {
      "id": "welcome",
      "depth": 2,
      "text": "Welcome!"
    }
  ],
  "body": {
    "type": "root",
    "children": [
      {
        "type": "element",
        "tag": "h2",
        "props": {
          "id": "welcome"
        },
        "children": [
          {
            "type": "element",
            "tag": "a",
            "props": {
              "ariaHidden": "true",
              "href": "#welcome",
              "tabIndex": -1
            },
            "children": [
              {
                "type": "element",
                "tag": "span",
                "props": {
                  "className": [
                    "icon",
                    "icon-link"
                  ]
                },
                "children": []
              }
            ]
          },
          {
            "type": "text",
            "value": "Welcome!"
          }
        ]
      }
    ]
  }
}
```

[検索](/ja/fetching#searchfield-value)や[Hooksによる拡張](/ja/advanced#contentfilebeforeinsert)を使用するために、Markdownボディへ内部的に`text`キーを追加します。

## CSV

変数bodyに行が代入されます。

### 用例

`content/home.csv`ファイル

```csv
title, description
Home, Welcome!
```

以下のように変換されます。

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".csv",
  "body": [
    {
      "title": "Home",
      "description": "Welcome!"
    }
  ]
}
```

## XML

XMLも解析できます。

### 用例

`content/home.xml`ファイル

```xml
<xml>
  <item prop="abc">
    <title>Title</title>
    <description>Hello World</description>
  </item>
</xml>
```

以下のように変換されます。

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".xml",
  "body": {
    "xml": {
      "item": [
        {
          "$": {
            "prop": "abc"
          },
          "title": [
            "Title"
          ],
          "description": [
            "Hello World"
          ]
      }
    ]
  }
}
```

## YAML / YML

定義したデータがドキュメント自体に注入されます。

> bodyは生成されません。

### 用例

`content/home.yaml`ファイル

```yaml
title: Home
description: Welcome!
```

以下のように変換されます。

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".yaml",
  "title": "Home",
  "description": "Welcome!"
}
```

## JSON / JSON5

定義したデータがドキュメント自体に注入されます。

> bodyは生成されません。

### 用例

`content/home.json`ファイル

```json
{
  "title": "Home",
  "description": "Welcome!"
}

```

以下のように変換されます。

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".json",
  "title": "Home",
  "description": "Welcome!"
}
```
