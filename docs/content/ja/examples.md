---
title: 実装例
description: 'これらの例を参考にして、@nuxt/content をアプリに実装する方法を学びましょう。'
position: 10
category: Community
---

アプリケーションに直接コピーできるこれらの実装例をみていきましょう。

## 使い方

### asyncData

```js
export default {
  async asyncData({ $content, params }) {
    const article = await $content('articles', params.slug).fetch()

    return {
      article
    }
  }
}
```

## 機能

### 検索

watchを使って検索入力コンポーネントを追加します。

```vue
<template>
  <div>
    <input v-model="query" type="search" autocomplete="off" />

    <ul v-if="articles.length">
      <li v-for="article of articles" :key="article.slug">
        <NuxtLink :to="{ name: 'blog-slug', params: { slug: article.slug } }">{{ article.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      query: '',
      articles: []
    }
  },
  watch: {
    async query (query) {
      if (!query) {
        this.articles = []
        return
      }

      this.articles = await this.$content('articles')
        .only(['title', 'slug'])
        .sortBy('createdAt', 'asc')
        .limit(12)
        .search(query)
        .fetch()
    }
  }
}
</script>
```

> [search documentation](/ja/fetching#searchfield-value)を参照してください

### ページネーション

前後のページへのリンクは`surround`メソッドを使って追加します。

```vue
<template>
  <div>
    <NuxtLink v-if="prev" :to="{ name: 'blog-slug', params: { slug: prev.slug } }">
      {{ prev.title }}
    </NuxtLink>

    <NuxtLink v-if="next" :to="{ name: 'blog-slug', params: { slug: next.slug } }">
      {{ next.title }}
    </NuxtLink>
  </div>
</template>

<script>
export default {
  async asyncData({ $content, params }) {
    const [prev, next] = await $content('articles')
      .only(['title', 'slug'])
      .sortBy('createdAt', 'asc')
      .surround(params.slug)
      .fetch()

    return {
      prev,
      next
    }
  }
}
</script>
```

> [surround documentation](/ja/fetching#surroundslug-options)を参照してください

### 目次

tocの配列をループさせて目次を追加し、`id` を使って目次にリンクさせ、`text` を使ってタイトルを表示します。タイトルのスタイルを変えるために `depth` を使うことができます。

```vue
<template>
  <ul>
    <li
      v-for="link of article.toc"
      :key="link.id"
      :class="{ 'toc2': link.depth === 2, 'toc3': link.depth === 3 }"
    >
      <NuxtLink :to="`#${link.id}`">{{ link.text }}</NuxtLink>
    </li>
  </ul>
</template>

<script>
export default {
  async asyncData({ $content, params }) {
    const article = await $content('articles', params.slug)
      .fetch()

    return {
      article
    }
  }
}
</script>
```

> [Table of Contents documentation](/ja/writing#table-of-contents)を参照してください
