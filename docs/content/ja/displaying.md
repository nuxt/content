---
title: コンテンツを表示する
description: 'You can use `<nuxt-content>` component directly in your template to display your Markdown.'
position: 5
category: 入門
---

<br>
<base-alert type="info">This section is only for Markdown files.</base-alert>

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

Markdonwファイルに書句ことができる内容についての詳細はこちらをご覧ください。[コンテンツを作成する](/ja/writing#markdown)

## Style

アプリのデザインによっては、Markdownを適切に表示するためにいくつかのスタイルを記述する必要があるかもしれません。

`<nuxt-content>`コンポーネントは自動的に`.nuxt-content`クラスを追加します。これを使用してスタイルをカスタマイズできます。

```css
.nuxt-content h1 {
  /* my custom h1 style */
}
```

[このドキュメントサイトでのスタイルカスタマイズの例](https://github.com/nuxt/content/blob/master/docs/pages/_slug.vue)を見てみましょう。
