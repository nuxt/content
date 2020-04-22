---
title: Displaying content
position: 5
category: Getting started
---

This module converts your `.md` files into a JSON AST tree structure. It supports by default code highlighting using [PrismJS](https://prismjs.com) and injects the theme defined in options into your Nuxt.js app, see [configuration](/configuration#markdownprismtheme).

So, you can use `nuxt-content` component directly in your template to display the **Markdown** body:

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

By default, depending on what you're using to style your app, you may need to write some style to properly display the markdown. You can check for an exemple in the [docs starter](https://github.com/nuxt-company/content-module/blob/master/starters/docs/pages/index/_slug.vue#L107).