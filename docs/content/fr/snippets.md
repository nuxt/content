---
title: Extraits
description: 'Apprenez comment implémenter @nuxt/content dans votre application avec ces extraits de code.'
position: 12
category: Community
subtitle: 'Découvrez ces extraits de code qui peuvent être copiés directement dans votre application.'
version: 1.1
---

## Utilisation

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

Ajouter des métadatas en fonction du titre et de la description définie dans [front-matter](https://content.nuxtjs.org/writing#front-matter) :

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

## Fonctionnalités

### Recherche

Ajoutez un composant de recherche à l'aide de watch :

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

> Consulter la [documentatio de recherche](/fetching#searchfield-value).

### Prev et Next

Ajoutez les liens précédents et suivants en utilisant la méthode `surround` :

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

> Consulter la [documentation de surround](/fetching#surroundslug-options).

### Table des matières

Ajoutez une table des matières en parcourant le tableau toc et utilisez l'`id` pour créer un lien vers celui-ci ainsi que le `text` pour afficher le titre. Nous pouvons utiliser la propriété `depth` pour styliser les titres différemment :

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

> Consulter la [documentation de la table des matières](/writing#table-of-contents).

### Routes dynamiques

Supposons que vous souhaitez créer une application avec des routes suivant la structure de fichier `content/`, vous pouvez le faire en créant un composant `pages/_.vue` :

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

De cette façon, si vous suivez la route `/themes/docs`, il affichera le fichier `content/themes/docs.md`. Si vous avez besoin d'une page d'index pour vos répertoires, vous devez créer un fichier avec le même nom que le répertoire :

```bash
content/
  themes/
    docs.md
  themes.md
```

<alert type="warning">

N'oubliez pas de préfixer vos appels avec les paramètres de langues si vous utilisez `nuxt-i18n`.

</alert>

### Surligneurs personnalisés

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
        return wrap(highlightjs.highlight(lang, rawCode).value, lang)
      }
    }
  }
}
```

#### Shiki

[Shiki](https://github.com/shikijs/shiki) est un surligneur de syntaxe qui utilise la grammaire TexMate et colore les éléments avec des thèmes VS Code. Il générera du HTML qui ressemble exactement à votre code dans VS Code.

Vous n'avez pas besoin d'ajouter un style personnalisé, car Shiki l'intègrera dans le HTML.

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

[Twoslash](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/ts-twoslasher) est un format de balisage pour le code TypeScript. En interne, Twoslash utilise le compilateur TypeScript pour générer des informations riches en surlignage.

Pour avoir une meilleure idée du fonctionnement de Twoslash, vous pouvez jeter un oeil à la [documentation officielle TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#type-aliases) et survolez un exemple de code là-bas.

Vous pouvez obtenir le même résultat en utilisant [Shiki Twoslash](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/shiki-twoslash). Ce package est également celui qui alimente la documentation officielle de TypeScript.

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
