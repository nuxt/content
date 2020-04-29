---
title: Afficher le contenu
position: 5
category: Commencer
---

This section is only for Markdown content files.

## Component

You can use `nuxt-content` component directly in your template to display the page body:

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

All the props passed to `nuxt-content` will be forwarded to your custom Vue.js components.

> Make sure to register your Vue.js components globally

## Style

Depending on what you're using to design your app, you may need to write some style to properly display the markdown.

`<nuxt-content>` component will automatically add a `.nuxt-content` class, you can use it to customize your styles:

```css
.nuxt-content h1 {
  /* my custom h1 style */
}
```

You can check for an exemple in the [docs starter](https://github.com/nuxt-company/content-module/blob/master/starters/docs/pages/index/_slug.vue).
