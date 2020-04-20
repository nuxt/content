---
title: Displaying content
position: 5
category: Getting started
---

You can use `nuxt-content` component directly in your template to display **Markdown** content:

```vue
<template>
  <nuxt-content :body="page.body" />
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