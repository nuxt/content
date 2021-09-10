---
title: Configuration
description: 'Vous pouvez configurer @nuxt/content avec la propriété content au sein du fichier nuxt.config.js'
category: Pour commencer
position: 6
---

Vous pouvez configurer `@nuxt/content` avec la propriété `content` au sein du fichier `nuxt.config.js`.

```js{}[nuxt.config.js]
export default {
  content: {
    // Ma configuration personnalisée
  }
}
```

Voir les [options par défaut](#configuration-par-défaut).

## Propriétés

### `apiPrefix`

- Type: `String`
- Défaut: `'/_content'`

La route qui sera utilisée pour les appels API côté client et les SSE.

```js{}[nuxt.config.js]
content: {
  // l'api $content sera disponible à l'adresse localhost:3000/content-api
  apiPrefix: 'content-api'
}
```

### `dir`

- Type: `String`
- Défaut: `'content'`

Le répertoire utilisé pour l'écriture du contenu. Vous pouvez fournir un chemin absolu, mais dans le cas où le chemin est relatif, il sera déterminé avec la propriété [srcDir](https://nuxtjs.org/api/configuration-srcdir) de Nuxt.

```js{}[nuxt.config.js]
content: {
  dir: 'mon-contenu' // lit le contenu depuis mon-contenu/
}
```

### `fullTextSearchFields`

- Type: `Array`
- Défaut: `['title', 'description', 'slug', 'text']`

Les champs qui ont besoin d'être indexés afin d'être recherchables, vous pouvez en apprendre plus sur les recherches [ici](/fr/fetching#searchfield-value).

`text` est une propriété spéciale qui contient votre Markdown avant qu'il soit converti en AST.

```js{}[nuxt.config.js]
content: {
  // Les recherches s'effectuent uniquement sur les champs titre et description
  fullTextSearchFields: ['title', 'description']
}
```

### `nestedProperties`

- Type `Array`
- Défaut: `[]`
- Version: **v1.3.0**

Vous pouvez enregistrer des propriétés imbriquées afin que la notation ponctuelle et le filtrage en profondeur soient pris en charge.

```js{}[nuxt.config.js]
content: {
  nestedProperties: ['categories.slug']
}
```

### `markdown`

Ce module se sert de [remark](https://github.com/remarkjs/remark) afin de compiler des fichiers Markdown vers du JSON AST qui sera stocké dans une variable `body`.

Par défaut, ce module a recours à des plugins pour améliorer la conversion du Markdown. Vous pouvez ajouter vos propres plugins ou modifier ceux par défaut en utilisant la propriété `basePlugins`. Chaque plugin est configuré en utilisant son nom en camelCase : `remark-external-links` => `externalLinks`.

> Vous pouvez retrouver des plugins pour remark [ici](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins).

### `markdown.basePlugins`

- Type: `Array`
- Défaut: `['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes']`

### `markdown.plugins`

- Type: `Array`
- Défaut: `[]`

### `markdown.externalLinks`

- Type: `Object`
- Défaut: `{}`

Vous pouvez controler le comportement des liens avec cette option. Consultez la liste des options [ici](https://github.com/remarkjs/remark-external-links#api).

```js{}[nuxt.config.js]
content: {
  markdown: {
    externalLinks: {
      target: '_self' // désactive target="_blank"
      rel: false // désactive rel="nofollow noopener"
    }
  }
}
```

### `markdown.footnotes`

- Type: `Object`
- Défaut: `{ inlineNotes: true }`

Vous pouvez controler le comportement des liens avec cette option. Consultez la liste des [ici](https://github.com/remarkjs/remark-footnotes#remarkusefootnotes-options).

### `markdown.prism.theme`

- Type: `String`
- Défaut: `'prismjs/themes/prism.css'`

Ce module gère la coloration syntaxique du contenu Markdown à l'aide de [PrismJS](https://prismjs.com).

Il insère automatiquement le thème PrismJS désiré au sein de votre configuration Nuxt.js, donc si souhaitez utiliser un thème différent de celui par défaut, consultez les [prism-themes](https://github.com/PrismJS/prism-themes):

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-material-oceanic.css'
    }
  }
}
```

Pour désactiver l'inclusion du thème, définissez prism à `false`:

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: false
    }
  }
}
```

### `yaml`

- Type: `Object`
- Défaut: `{}`

Ce module utilise `js-yaml` pour convertir les fichiers yaml, vous pouvez consulter les options [ici](https://github.com/nodeca/js-yaml#api).

Notez que nous forçons l'option `json: true`.

### `csv`

- Type: `Object`
- Défaut: `{}`

Ce module utilise `node-csvtojson` pour convertir les fichiers csv, vous pouvez consulter les options [ici](https://github.com/Keyang/node-csvtojson#parameters).

## Configuration par défaut

```js{}[nuxt.config.js]
export default {
  content: {
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug', 'text'],
    nestedProperties: [],
    markdown: {
      externalLinks: {},
      footnotes: {
        inlineNotes: true
      },
      basePlugins: ['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes'],
      plugins: [],
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {}
  }
}
```
