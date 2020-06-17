---
title: テーマを利用する (実装中)
description: 'テーマを追加して、Nuxtと@nuxt/contentで開発を加速させましょう。'
category: テーマ
position: 8
---

<br>
<base-alert type="info">

  [NuxtJS](https://nuxtjs.org)にテーマを**近日公開**します。  
  最新情報は [Twitter](https://twitter.com/nuxt_js) や [GitHub](https://github.com/nuxt/nuxt.js) をご覧ください。

</base-alert>

以下のように設定します。

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxtjs/theme-everest
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxtjs/theme-everest
  ```

  </code-block>
</code-group>

`nuxt.config.js`にテーマを追加します。

```js[nuxt.config.js]
export default {
  theme: '@nuxtjs/theme-everest'
}
```

これだけで`content/`ディレクトリの中で書き始められます。  
美しいドキュメントのウェブサイト、ブログ、ポートフォリオなどを楽しんでください。
