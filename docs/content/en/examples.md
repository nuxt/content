---
title: Examples
description: 'Learn how to implement @nuxt/content into your app with these examples.'
position: 10
category: Community
---

Check out these examples that can be copied directly into your application.

## Usage

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

## Features

### Pagination

Add previous and next links using the `surround` method:

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

> Check out the [surround documentation](/fetching#surroundslug-options)

### Table of contents

Add a table of contents by looping over our array of toc and use the `id` to link to it and the `text` to show the title. We can use the `depth` to style the titles differently:

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
    const article = await $content('articles', params.slug).fetch()

    return {
      article
    }
  }
}
</script>
```

> Check out the [TOC documentation](/writing#table-of-contents)