---
title: Snippets
description: 'Learn how to implement @nuxt/content into your app with these code snippets.'
position: 12
category: Community
subtitle: 'Check out these code snippets that can be copied directly into your application.'
version: 1.1
---

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

### head

Add dynamic metas based on title and description defined in the [front-matter](https://content.nuxtjs.org/writing#front-matter):

```js
export default {
  async asyncData({ $content, params }) {
    const article = await $content('articles', params.slug).fetch()

    return {
      article
    }
  },
  head() {
    return {
      title: this.article.title,
      meta: [
        { hid: 'description', name: 'description', content: this.article.description },
        // Open Graph
        { hid: 'og:title', property: 'og:title', content: this.article.title },
        { hid: 'og:description', property: 'og:description', content: this.article.description },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.article.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.article.description }
      ]
    }
  }
}
```

## Features

### Search

Add a search input component by using watch:

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

> Check out the [search documentation](/fetching#searchfield-value)

### Prev and Next

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

<alert type="info">

If more than one document has the same slug, you should set `path` as the first argument of the `surround` method, instead of `slug`.
This is because Nuxt Content finds previous and next documents based on the one that matched first.

For example, if you sort documents according to `position`, the lower-positioned document will be always used for calculation,
even when the current page is showing the higer-positioned document.

</alert>

> Check out the [surround documentation](/fetching#surroundslug-options)

### Case-Insensitive Sorting

It is needed to work around Nuxt Content's case-sensitive sorting, to add extra properties to documents, whose value is lower-cased.

```js [nuxt.config.js]
export default {
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        Object.entries(document).forEach(([key, value]) => {
          const _key = `case_insensitive__${key}`; // prefix is arbitrary

          if (!document[_key] && typeof value === 'string') {
            document[_key] = value.toLocaleLowerCase();
          }
        });
      }
    }
  }
};
```

Then, call `sortBy` method with the extra prop's key by which to sort.

```ts
export default {
  async asyncData({ $content, params }) {
    const articles = await $content('articles', params.slug)
      .sortBy('case_insensitive__title', 'asc') // Set prefixed prop
      .fetch()

    return {
      articles
    }
  }
}
```

> Check out the [`sortBy` documentation](/fetching#sortbykey-direction)

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
    const article = await $content('articles', params.slug)
      .fetch()

    return {
      article
    }
  }
}
</script>
```

> Check out the [Table of contents documentation](/writing#table-of-contents)

### Dynamic routing

Let's say you want to create an app with routes following the `content/` file structure. You can do so by creating a `pages/_.vue` component:

```vue[pages/_.vue]
<script>
export default {
  async asyncData ({ $content, app, params, error }) {
    const path = `/${params.pathMatch || 'index'}`
    const [article] = await $content({ deep: true }).where({ path }).fetch()

    if (!article) {
      return error({ statusCode: 404, message: 'Article not found' })
    }

    return {
      article
    }
  }
}
</script>
```

This way, if you go the `/themes/docs` route, it will display the `content/themes/docs.md` file. If you need an index page for your directories, you need to create a file with the same name as the directory:

```bash
content/
  themes/
    docs.md
  themes.md
```

<alert type="warning">

Don't forget to prefix your calls with the current locale if you're using `nuxt-i18n`.

</alert>

### Custom Highlighter

#### Highlight.js

```js{}[nuxt.config.js]
import highlightjs from 'highlight.js'

const wrap = (code, lang) => `<pre><code class="hljs ${lang}">${code}</code></pre>`

export default {
  // Complete themes: https://github.com/highlightjs/highlight.js/tree/master/src/styles
  css: ['highlight.js/styles/nord.css'],

  modules: ['@nuxt/content'],

  content: {
    markdown: {
      highlighter(rawCode, lang) {
        if (!lang) {
          return wrap(highlightjs.highlightAuto(rawCode).value, lang)
        }
        return wrap(highlightjs.highlight(rawCode, { language: lang }).value, lang)
      }
    }
  }
}
```

#### Shiki

[Shiki](https://github.com/shikijs/shiki) is syntax highlighter that uses TexMate grammar and colors the tokens with VS Code themes. It will generate HTML that looks like exactly your code in VS Code.

You don't need to add custom styling, because Shiki will inline it in the HTML.

```js{}[nuxt.config.js]
import shiki from 'shiki'

export default {
  modules: ['@nuxt/content'],

  content: {
    markdown: {
      async highlighter() {
        const highlighter = await shiki.getHighlighter({
          // Complete themes: https://github.com/shikijs/shiki/tree/master/packages/themes
          theme: 'nord'
        })
        return (rawCode, lang) => {
          return highlighter.codeToHtml(rawCode, lang)
        }
      }
    }
  }
}
```

#### Shiki Twoslash

[Twoslash](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/ts-twoslasher) is a markup format for TypeScript code. Internally, Twoslash uses the TypeScript compiler to generate rich highlight info.

To get a better idea of how Twoslash works, you can go over to the [Official TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#type-aliases) and hover over some code examples there.

You can achieve the same result by using [Shiki Twoslash](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/shiki-twoslash). This package is also the one that powers the Official TypeScript Documentation.

```js{}[nuxt.config.js]
import {
  createShikiHighlighter,
  runTwoSlash,
  renderCodeToHTML
} from 'shiki-twoslash'

export default {
  modules: ['@nuxt/content'],

  content: {
    markdown: {
      async highlighter() {
        const highlighter = await createShikiHighlighter({
          // Complete themes: https://github.com/shikijs/shiki/tree/master/packages/themes
          theme: 'nord'
        })
        return (rawCode, lang) => {
          const twoslashResults = runTwoSlash(rawCode, lang)
          return renderCodeToHTML(
            twoslashResults.code,
            lang,
            ['twoslash'],
            {},
            highlighter,
            twoslashResults
          )
        }
      }
    }
  }
}
```

### Remark Plugin

Nuxt Content uses [remark](https://github.com/remarkjs/remark) under the hood to process markdown documents. Creating remark plugins is a way to manipulate documents and add new features.

#### List all contributors

Let's say you want to list all contributors of the project in a document. You can create a plugin that fetches all contributors and injects them into the document data.

- Create the plugin. This plugin fetches the contributors if `fetchContributors` is set to `true`

```js [~~/plugins/contributors.js]
const fetch = require('node-fetch')

module.exports = function () {
  return async (tree, { data }) => {
    if (data.fetchContributors) {
      const contributors = await fetch(
        'https://api.github.com/repos/nuxt/content/contributors'
      ).then(res => res.json())
      .then(res => res.map(({ login }) => login))

      data.$contributors = [...new Set(contributors)]
    }
    return tree
  }
}
```

- Register plugin in Nuxt config

```js{}[nuxt.config.js]
export default {
  contents: {
    markdown: {
      remarkPlugins: [
        '~~/plugins/contributors.js'
      ]
    }
  }
}
```

- Create a simple component to show contributors

```vue{}[~~/components/List.vue]
<template>
  <ul>
    <li v-for="(item, i) in items" :key="i">
      {{ item }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
```

- Finally use the components and mark the document to fetch the contributors

```md{}[document.md]
---
title: Nuxt Content
fetchContributors: true
---

## Contributors

<list :items="$contributors"></list>

```
