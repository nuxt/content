---
title: Utilisation avancée
description: Apprenez l'utilisation avancée du module @nuxt/content
position: 7
category: Pour commencer
---

## Utilisation Programmatique

`$content` est accessible depuis **@nuxt/content**.

<alert>

Notez que vous ne pouvez y accéder seulement **après que le module ait été chargé** par Nuxt. L'utilisation de `require(@nuxt/content)` devrait avoir lieu dans les hooks ou les méthodes internes de Nuxt.

</alert>

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async ready () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['slug']).fetch()
      console.log(files)
    }
  }
}
```

### Génération de Site Statique

<alert type="info">

Si vous utilisez Nuxt 2.13+, la commande `nuxt export` a une fonctionnalité de crawler intégrée, donc vous ne devriez pas avoir besoin de recourir à `generate.routes`.

</alert>

Lors de l'utilisation de `nuxt generate`, vous devez spécifier les routes dynamiques avec `generate.routes`, car Nuxt ne sait pas quelles seront ces routes donc il ne sera pas capable de les générer.

**Exemple**

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async routes () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['path']).fetch()

      return files.map(file => file.path === '/index' ? '/' : file.path)
    }
  }
}
```

## Hooks

Ce module ajoute des hooks que vous pouvez utiliser:

### `content:file:beforeInsert`

Vous permez d'ajouter des données à un document avant qu'il ne soit stocké.

Arguments:

- `document`
  - Type: `Object`
  - Propriétés:
    - Voir [écrire du contenu](/fr/writing)

**Exemple**

En prenant l'exemple du blog starter, on utilise `file:beforeInsert` pour ajouter une propritété `readingTime` à un document en se servant de [reading-time](https://github.com/ngryman/reading-time).

> `text` est le contenu du corps d'un fichier Markdown avant qu'il ne soit transformé en JSON AST, vous pouvez l'utiliser à ce stade mais il n'est pas retourné par l'API.

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        const { time } = require('reading-time')(document.text)

        document.readingTime = time
      }
    }
  }
}
```

## Gérer le Rechargement à Chaud

<alert type="info">

Lorsque vous développez, ce module appellera automatiquement l'action `nuxtServerInit` (si elle est définie) et `$nuxt.refresh()` afin de rafraîchir la page actuelle.

</alert>

Dans le cas où vous souhaiteriez écouter cet évènement et ajouter des instructions supplémentaires, vous pouvez écouter l'évènement `content:update` côté client en utilisant `$nuxt.$on('content:update')`:

```js{}[plugins/update.client.js
export default function ({ store }) {
  // Uniquement en développement
  if (process.dev) {
    window.onNuxtReady(($nuxt) => {
      $nuxt.$on('content:update', ({ event, path }) => {
        // Raffraîchit le store des catégories
        store.dispatch('fetchCategories')
      })
    })
  }
}
```

Ajoutez ensuite votre plugin dans votre fichier `nuxt.config.js`:

```js{}[nuxt.config.js]
export default {
  plugins: [
    '@/plugins/update.client.js'
  ]
}
```

Dès lors que vous opèrerez un changement sur un des fichiers au sein du répertoire `content/`, la méthode `fetchCategories` sera appelée. D'ailleurs, cette documentation l'utilise, vous pouvez en apprendre davantage en jetant un oeil à [plugins/categories.js](https://github.com/nuxt/content/blob/master/docs/plugins/categories.js).

## Intégration avec @nuxtjs/feed

Dans le cas d'articles, le contenu peut être utilisé pour générer des fils d'actualités en utilisant le module [@nuxtjs/feed](https://github.com/nuxt-community/feed-module).

<alert type="info">

Pour utiliser `$content` au sein de l'option `feed`, vous devez ajouter `@nuxt/content` avant `@nuxtjs/feed` dans la propriété `modules`.

</alert>

**Exemple**

```js
export default {
  modules: [
    '@nuxt/content',
    '@nuxtjs/feed'
  ],

  feed () {
    const baseUrlArticles = 'https://mywebsite.com/articles'
    const baseLinkFeedArticles = '/feed/articles'
    const feedFormats = {
      rss: { type: 'rss2', file: 'rss.xml' },
      atom: { type: 'atom1', file: 'atom.xml' },
      json: { type: 'json1', file: 'feed.json' },
    }
    const { $content } = require('@nuxt/content')

    const createFeedArticles = async function (feed) {
      feed.options = {
        title: 'Mon Blog',
        description: 'J\'écris à propos de la téchnologie',
        link: baseUrlArticles,
      }
      const articles = await $content('articles').fetch()

      articles.forEach((article) => {
        const url = `${baseUrlArticles}/${article.slug}`

        feed.addItem({
          title: article.title,
          id: url,
          link: url,
          date: article.published,
          description: article.summary,
          content: article.summary,
          author: article.authors,
        })
      })
    }

    return Object.values(feedFormats).map(({ file, type }) => ({
      path: `${baseLinkFeedArticles}/${file}`,
      type: type,
      create: feedCreateArticles,
    }))
  }
}
```
