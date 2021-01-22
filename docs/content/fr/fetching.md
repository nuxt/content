---
title: Récupérer du contenu
description: 'Apprenez comment récupérer votre contenu static en utilisant $content dans votre projet Nuxt.js.'
position: 4
category: Pour commencer
---

Ce module injecte globalement une instance de `$content`, ce qui veut dire que vous pouvez y accéder n'importe où en utilisant `this.$content`. En ce qui concerne les plugins, asyncData, fetch, nuxtServerInit et la partie Middleware, vous pouvez y accéder depuis `context.$content`.

## Méthodes

### $content(path, options?)

- `path`
  - Type: `String`
  - Défaut: `/`
  - `requis`
- `options`
  - Type: `Object`
  - Défaut: `{ deep: false }`
  - Version: **v1.3.0**
- Retourne une séquence de chaîne

> Vous pouvez églament passer plusieurs arguments : `$content('articles', params.slug)` sera traduit en `/articles/${params.slug}`

`path` peut désigner un fichier ou un répertoire. Si c'est un fichier, la méthode`fetch()` retournera un `Object`, si c'est un répertoire elle retournera un `Array`.

Vous pouvez passer `{ deep: true }` en tant que second argument afin de récupérer les fichiers contenus dans les sous-répertoires.

Toutes les méthodes ci-dessous peuvent être chainées et renvoient une séquence de chaîne, à l'exception de `fetch` qui retourne une `Promise`.

### only(keys)

- `keys`
  - Type: `Array` | `String`
  - `requis`

Sélectionne un sous-ensemble de champs.

```js
const { titre } = await this.$content('article-1').only(['titre']).fetch()
```

### without(keys)

- `keys`
  - Type: `Array` | `String`
  - `required`

Retire un sous-ensemble de champs.

```js
const { title, ...propsWithoutBody } = await this.$content('article-1').without(['body']).fetch()
```

### where(query)

- `query`
  - Type: `Object`
  - `requis`

Filtre les résultats par le biais d'une requête.

Les requêtes Where sont basées sur un sous-ensemble issu de la syntaxe des requêtes mongo, on retrouve par exemple : `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, ...

```js
// implicite (suppose l'opérateur $eq)
const articles = await this.$content('articles').where({ title: 'Home' }).fetch()
// explicite $eq
const articles = await this.$content('articles').where({ title: { $eq: 'Home' } }).fetch()

// $gt
const articles = await this.$content('articles').where({ age: { $gt: 18 } }).fetch()
// $in
const articles = await this.$content('articles').where({ name: { $in: ['odin', 'thor'] } }).fetch()
```

Pour filtrer des objets et des tableaux, vous devez configurer la propritété `nestedProperties`, voir la partie [configuration](/fr/configuration#nestedproperties).

```js
const produits = await this.$content('produits').where({ 'categories.slug': { $contains: 'haut' } }).fetch()

const produits = await this.$content('produits').where({ 'categories.slug': { $contains: ['haut', 'femme'] } }).fetch()
```

Ce module utilise en interne LokiJS, vous pouvez allez voir des [exemples de requêtes](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

### sortBy(key, direction)

- `key`
  - Type: `String`
  - `requis`
- `direction`
  - Type: `String`
  - Valeur: `'asc'` ou `'desc'`
  - Défaut: `'asc'`

Trie les résultats par clé.

```js
const articles = await this.$content('articles').sortBy('titre').fetch()
```

> Peut-être chainé afin d'effectuer un tri sur plusieurs champs.

### limit(n)

- `n`
  - Type: `String` | `Number`
  - `requis`

Limite le nombre de résultats.

```js
// fetch only 5 articles
const articles = await this.$content('articles').limit(5).fetch()
```

### skip(n)

- `n`
  - Type: `String` | `Number`
  - `requis`

Détermine le nombre de résultat à passer.

```js
// fetch the next 5 articles
const articles = await this.$content('articles').skip(5).limit(5).fetch()
```

### search(field, value)

- `field`
  - Type: `String`
  - `requis`
- `value`
  - Type: `String`

Effectue une recherche plein texte sur un champ. Le paramètre `value` est optionnel, dans ce cas `field` devient la `value`  et la recherche est alors effectuée sur tous les champs définis en tant que champ de recherche plein texte.

Le champ sur lequel vous voulez effectuer la recherche doit être défini dans les options afin d'être indexé, voir [configuration](/fr/configuration#fulltextsearchfields).

```js
// Search on field title
const articles = await this.$content('articles').search('titre', 'bienvenue').fetch()
// Search on all pre-defined fields
const articles = await this.$content('articles').search('bievenue').fetch()
```

### surround(slug, options)

- `slug`
  - Type: `String`
  - `requis`
- `options`
  - Type: `Object`
  - Défaut: `{ before: 1, after: 1}`

Récupère les résultats qui précédent et suivent un résultat spécifique.

Vous obtiendrez toujours un tableau de longueur fixe, rempli avec les éléments correspondants ou la valeur `null`.

```js
const [prev, next] = await this.$content('articles')
  .only(['titre', 'chemin'])
  .sortBy('date')
  .where({ isArchived: false })
  .surround('article-2')
  .fetch()

// Renvoie
[
  {
    titre: 'Article 1',
    chemin: 'article-1'
  },
  null // pas d'article-3 ici
]
```

> `search`, `limit` et `skip` sont inutiles lorsque l'on utilise cette méthode.

### fetch()

- Renvoie: `Promise<Object>` | `Promise<Array>`

Met fin à la séquence de chaînes et collecte les données.

## Exemple

```js
const articles = await this.$content('articles')
  .only(['titre', 'date', 'auteurs'])
  .sortBy('date', 'asc')
  .limit(5)
  .skip(10)
  .where({
    tags: 'testing',
    isArchived: false,
    date: { $gt: new Date(2020) },
    rating: { $gte: 3 }
  })
  .search('bienvenue')
  .fetch()
```

## API

Lorsque vous développez, ce module expose une API qui vous permet facilement de consulter les données de chaque répertoire ou fichier au format JSON, à l'adresse http://localhost:3000/_content/. Par défaut, le préfixe est `_content` mais il peut être configuré à l'aide la la propriété [apiPrefix](/fr/configuration#apiprefix).

Exemple:

```bash
-| content/
---| articles/
------| hello-world.md
---| index.md
---| settings.json
```

Exposera sur `localhost:3000`:

- `/_content/articles`: la liste des fichiers dans `content/articles/`
- `/_content/articles/hello-world`: renvoie `hello-world.md` au format JSON
- `/_content/index`: renvoie `index.md` au format JSON
- `/_content/settings`: renvoie `settings.json` au format JSON
- `/_content`: liste `index` et `settings`

Cet endpoint est accessible via des requêtes `GET` et `POST`, vous pouvez donc utiliser des paramètres dans vos requêtes:

[http://localhost:3000/_content/articles?only=titre&only=description&limit=10](http://localhost:3000/_content/articles?only=titre&only=description&limit=10).

Vous pouvez en apprendre plus à propos de cet endpoint dans [lib/middleware.js](https://github.com/nuxt/content/blob/master/lib/middleware.js).
