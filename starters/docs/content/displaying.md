---
title: Displaying content
position: 5
category: Getting started
---

You can use `nuxt-content` component directly in your template to display **Markdown** content:

```vue
<template>
  <article>
    <h1>{{ page.title }}</h1>
    <nuxt-content :body="page.body" />
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