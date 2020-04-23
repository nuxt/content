---
title: Displaying content
position: 5
category: Getting started
---

This section is only for Markdown content files.

## Component

You can use `nuxt-content` component directly in your template to display the body:

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

### Syntax highlighting

This module converts your `.md` files into a JSON AST tree structure. It supports by default code highlighting using [PrismJS](https://prismjs.com) and injects the theme defined in options into your Nuxt.js app, see [configuration](/configuration#markdownprismtheme).

### HTML

You can write HTML in your Markdown:

```md[home.md]
---
title: Home
---

## HTML

<p><span class="note">A mix of <em>Markdown</em> and <em>HTML</em>.</span></p>
```

### Links

Links are transformed to add valid `target` and `rel` attributes. You can change this behaviour, see [configuration](/configuration#markdownexternallinks). Relative links are also automatically transformed to `nuxt-link` to provide navigations between page components and enhance performances with smart prefetching.

Here is an exemple using external, relative, markdown, html links, but also custom vue.js components:

```md[home.md]
---
title: Home
---

## Links

<nuxt-link to="/articles">Nuxt Link to Blog</nuxt-link>

<a href="/articles">Html Link to Blog</a>

[Markdown Link to Blog](/articles)

<a href="https://nuxtjs.org">External link html</a>

[External Link markdown](https://nuxtjs.org)
```

### Custom components

You can use Vue.js components direclty in your markdown files:

```md[home.md]
---
title: Home
---

## Custom components

<hello :name="name"></hello>
```

```vue[home.vue]
<template>
  <article>
    <h1>{{ page.title }}</h1>
    <nuxt-content :body="page.body" :name="name" />
  </article>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fetch()

    return {
      page,
      name: 'John'
    }
  }
}
</script>
```

All the props passed to `nuxt-content` will be forwarded to your custom Vue.js components.

> Make sure to register your Vue.js components globally

## Style

Depending on what you're using to design your app, you may need to write some style to properly display the markdown. You can check for an exemple in the [docs starter](https://github.com/nuxt-company/content-module/blob/master/starters/docs/pages/index/_slug.vue#L107).