---
title: Docs
description: 'テーマを使って、Nuxtと@nuxt/contentで開発を加速させましょう。'
category: Themes
position: 8
version: 1.6
---

<alert type="info">

最初の`@nuxt/content`テーマを試してみてください。このサイトのような美しいドキュメントを数秒で作成できます。

</alert>

`docs/`ディレクトリにオープンソースプロジェクトのドキュメントを作成しているとしましょう。

## セットアップ

テーマの利用方法は、今までのNuxtJSアプリと同様です。セットアップに必要なものは以下です：

### `package.json`

> このファイルは`npm init`でも生成されます

`nuxt`と`@nuxt/content-theme-docs`をインストールします:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add nuxt @nuxt/content-theme-docs
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install nuxt @nuxt/content-theme-docs
  ```

  </code-block>
</code-group>

**例**

```json[package.json]
{
  "name": "docs",
  "version": "1.0.0",
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate"
  },
  "dependencies": {
    "@nuxt/content-theme-docs": "^0.1.1",
    "nuxt": "^2.14.0"
  }
}
```

### `nuxt.config.js`

theme関数を`@nuxt/content-theme-docs`からimportします：

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme()
```

このテーマは、`nuxt.config.js`でデフォルトの設定を追加/上書きするための関数を用意しています。

> 設定がどのようにマージされるかを知るには、[defu.fn](https://github.com/nuxt-contrib/defu#function-merger)のドキュメントを見てください

**例**

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({

  loading: { color: '#48bb78' },
  generate: {
    fallback: '404.html', // for Netlify
    routes: ['/'] // give the first url to start crawling
  },
  i18n: {
    locales: () => [{
      code: 'fr',
      iso: 'fr-FR',
      file: 'fr-FR.js',
      name: 'Français'
    }, {
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en'
  },
  buildModules: [
    ['@nuxtjs/google-analytics', {
      id: 'UA-12301-2'
    }]
  ]
})
```

<alert>

`nuxt.config.js`で追加したモジュールの依存関係をインストールすることを忘れないでください。

</alert>

### `content/`

このテーマは国際化に[nuxt-i18n](https://github.com/nuxt-community/i18n-module)を使用します。そのデフォルトは`en`ロケールであるため、`content/en/`サブディレクトリを作成する必要があります。その後、Markdownファイルの書き込みを開始できます

### `static/`

ここに、ロゴなどの静的アセットを配置します

<alert type="info">

`static/icon.png`ファイルを追加することで、[nuxt-pwa](https://pwa.nuxtjs.org/)を有効化し、faviconを自動生成できます。

*アイコンは512x512以上の大きさの正方形である必要があります*

</alert>

<alert type="info">

`static/preview.png`ファイルを追加することで、ソーシャルプレビュー画像をメタに含められます

*画像サイズは640×320px以上にしてください（1280×640pxが最適です）*

</alert>

**例**

```bash
content/
  en/
    index.md
static/
  favicon.ico
nuxt.config.js
package.json
```

## Content

`content/`ディレクトリのMarkdownファイルはページになり、左側のナビゲーションにリストされます。

適切に機能させるには、Markdownのフロントマターに以下のプロパティを必ず含めてください：

- `title`
  - Type: `String`
  - `required`
  - *ページのタイトルはメタに挿入されます*
- `description`
  - Type: `String`
  - `required`
  - *ページの説明はメタに挿入されます*
- `position`
  - Type: `Number`
  - `required`
  - *ナビゲーションでドキュメントをソートするために使用されます*
- `category`
  - Type: `String`
  - `required`
  - *ナビゲーションでドキュメントをグループ化するために使用されます*
- `version`
  - Type: `Float`
  - *ドキュメントが更新されることをバッジでユーザーへ警告するために使用できます。一度ページが表示されると、バージョンが上がるまではローカルストレージに保存されます。*
- `fullscreen`
  - Type: `Boolean`
  - *`toc`がないときにページを拡大するために使用できます*

**例**

```md
---
title: Introduction
description: 'Empower your NuxtJS application with @nuxt/content module.'
position: 1
category: Getting started
version: 1.4
fullscreen: false
---
```

## 設定

テーマの設定をするために、`content/settings.json`を作成できます。

- `title`
  - Type: `String`
  - *ドキュメントのタイトル*
- `url`
  - Type: `String`
  - *ドキュメントがデプロイされるURL*
- `logo`
  - Type: `String` | `Object`
  - *プロジェクトのロゴ。[color mode](https://github.com/nuxt-community/color-mode-module)ごとにロゴを設定する`Object`にもできます*
- `github`
  - Type: `String`
  - *最新バージョン、リリースページ、ページ上部のGitHubへのリンク、 `このページをGitHubで編集する`リンク などを各ページへ表示させるには、GitHubレポジトリを`${org}/${name}`の形式で追加します*
- `twitter`
  - Type: `String`
  - *リンクさせたいTwitterユーザー名*

**例**

```json
{
  "title": "Nuxt Content",
  "url": "https://content.nuxtjs.org",
  "logo": {
    "light": "/logo-light.svg",
    "dark": "/logo-dark.svg"
  },
  "github": "nuxt/content",
  "twitter": "@nuxt_js"
}
```

## コンポーネント

このテーマには、Markdownコンテンツで直接使用できるいくつかのVue.jsコンポーネントが付属しています：

### `<alert>`

**Props**

- `type`
  - Type: `String`
  - Default: `'warning'`
  - Values: `['warning', 'info']`

**例**

```md
<alert>

Check out a warning alert with a `codeblock`!

</alert>
```

**結果**

<alert>

Check out a warning alert with a `codeblock`!

</alert>

**例**

```md
<alert type="info">

Check out an info alert with a [link](/themes/docs).

</alert>
```

**結果**

<alert type="info">

Check out an info alert with a [link](/themes/docs).

</alert>

### `<list>`

**Props**

- `items`
  - Type: `Array`
  - Default: `[]`

**例**

```md
---
items:
  - Item1
  - Item2
  - Item3
---

<list :items="items"></list>
```

**結果**

<list :items="['Item1', 'Item2', 'Item3']"></list>

### `<code-group>`

このコンポーネントは`slots`を利用しています。以下の`code-block`を参照してください。

### `<code-block>`

**Props**

- `label`
  - Type: `String`
  - `required`
- `active`
  - Type: `Boolean`
  - Default: `false`

**例**

```html
# Backslashes are for demonstration

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content-theme-docs
  \```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content-theme-docs
  \```

  </code-block>
</code-group>
```

**結果**

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content-theme-docs
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content-theme-docs
  ```

  </code-block>
</code-group>

### `<code-sandbox>`

**Props**

- `src`
  - Type: `String`
  - `required`

**例**

```md
---
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

<code-sandbox :src="link"></code-sandbox>
```

**結果**

<code-sandbox src="https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark"></code-sandbox>

## 画像

2つのバージョンがある場合、`dark-img`と`light-img`クラスを画像に適用することで、カラーモードに依存した依存関係を自動的に切替えられます。

**例**

```md
<img src="/img-light.svg" class="light-img" alt="Image light" />
<img src="/img-dark.svg" class="dark-img" alt="Image dark" />
```
