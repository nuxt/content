---
title: コンテンツを表示する
description: 'You can use `<nuxt-content>` component directly in your template to display your Markdown.'
position: 5
category: 入門
---

<base-alert type="info">ここではMarkdownファイルのみを対象としています。</base-alert>

## Component

template内で `<nuxt-content>` コンポーネントを直接使用してpageのbodyを表示できます。

```vue
<template>
  <article>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </article>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fetch()

    return {
      page
    }
  }
}
</script>
```


**Props:**
- document:
  - Type: `Object`
  - `required`

Markdonwファイルに書くことができる内容についての詳細はこちらをご覧ください。[コンテンツを作成する](/ja/writing#markdown)

## Style

アプリのデザインによっては、Markdownを適切に表示するためにいくつかのスタイルを記述する必要があるかもしれません。

`<nuxt-content>`コンポーネントは自動的に`.nuxt-content`クラスを追加します。これを使用してスタイルをカスタマイズできます。

```css
.nuxt-content h1 {
  /* my custom h1 style */
}
```

[このドキュメントサイトでのスタイルカスタマイズの例](https://github.com/nuxt/content/blob/master/docs/pages/_slug.vue)を見てみましょう。

## ライブ編集

> バージョン**>= v1.4.0** で利用可能です。
**開発中のみ**、`<nuxt-content>`コンポーネント上で**ダブルクリック**することで、コンテンツを編集することができます。テキストエリアは、現在のファイルの内容を編集することができ、ファイルシステムに保存されます。

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content-ui_otfj5y.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content-ui_otfj5y.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1592314331/nuxt-content-ui_otfj5y.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content-ui_otfj5y.ogv" type="video/ogg" />
</video>
