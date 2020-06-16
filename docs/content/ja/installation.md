---
title: インストール
description: 'たった2つのステップであなたのNuxtプロジェクトに@nuxt/contentをインストールします'
category: 入門
position: 2
---

プロジェクトに `@nuxt/content` の依存関係を追加します。

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content
  ```

  </code-block>
</code-group>

そして、`nuxt.config.js` の `modules` セクションに `@nuxt/content` を追加します。

```js[nuxt.config.js]
{
  modules: [
    '@nuxt/content'
  ],
  content: {
    // Options
  }
}
```

## TypeScript

tsconfig.json内の"types"配列へ、`@nuxt/types` (Nuxt 2.9.0+)もしくは`@nuxt/vue-app`に続けて型を追記します。

**tsconfig.json**

```json
{
  "compilerOptions": {
    "types": [
      "@nuxt/types",
      "@nuxt/content"
    ]
  }
}
```

> **なぜ?**
>
> nuxt の動作方法のため、コンテキストの `$content` プロパティは TypeScriptの[declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)機能 を通して、nuxt `Context` インターフェースにマージする必要があります。型に `@nuxt/content` を追加すると、パッケージから型をインポートし、TypeScript が `Context` インターフェースに追加されたものを認識するようになります。
