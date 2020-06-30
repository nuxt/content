---
title: Fetching content
description: 'Learn how to fetch your static content with $content in your Nuxt.js project.'
position: 4
category: Getting started
---

This module globally injects `$content` instance, meaning that you can access it anywhere using `this.$content`. For plugins, asyncData, fetch, nuxtServerInit and Middleware, you can access it from `context.$content`.

## Methods

### $content(path, options?)

- `path`
  - Type: `String`
  - Default: `/`
- `options`
  - Type: `Object`
  - Default: `{}`
  - Version: **>= v1.3.0**
- `options.deep`
  - Type: `Boolean`
  - Default: `false`
  - Version: **>= v1.3.0**
  - *Fetch files from subdirectories*
- `options.text`
  - Type: `Boolean`
  - Default: `false`
  - Version: **>= v1.4.0**
  - *Returns the original markdown content in a `text` variable*
- Returns a chain sequence

> You can also give multiple arguments: `$content('articles', params.slug)` will be translated to `/articles/${params.slug}`

`path` can be a file or a directory. If `path` is a file, `fetch()` will return an `Object`, if it's a directory it will return an `Array`.

All the methods below can be chained and return a chain sequence, except `fetch` which returns a `Promise`.

### only(keys)

- `keys`
  - Type: `Array` | `String`
  - `required`

Select a subset of fields.

```js
const { title } = await this.$content('article-1').only(['title']).fetch()
```

### without(keys)

- `keys`
  - Type: `Array` | `String`
  - `required`

Remove a subset of fields.

```js
const { title, ...propsWithoutBody } = await this.$content('article-1').without(['body']).fetch()
```

### where(query)

- `query`
  - Type: `Object`
  - `required`

Filter results by query.

Where queries are based on subset of mongo query syntax, it handles for example: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, ...

```js
// implicit (assumes $eq operator)
const articles = await this.$content('articles').where({ title: 'Home' }).fetch()
// explicit $eq
const articles = await this.$content('articles').where({ title: { $eq: 'Home' } }).fetch()

// $gt
const articles = await this.$content('articles').where({ age: { $gt: 18 } }).fetch()
// $in
const articles = await this.$content('articles').where({ name: { $in: ['odin', 'thor'] } }).fetch()
```

In order to filter in objects and array you need to enable nestedProperties, see [configuration](/configuration#nestedproperties).

```js
const products = await this.$content('products').where({ 'categories.slug': { $contains: 'top' } }).fetch()

const products = await this.$content('products').where({ 'categories.slug': { $contains: ['top', 'woman'] } }).fetch()
```

> This module uses LokiJS under the hood, you can check for [query examples](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

### sortBy(key, direction)

- `key`
  - Type: `String`
  - `required`
- `direction`
  - Type: `String`
  - Value: `'asc'` or `'desc'`
  - Default: `'asc'`

Sort results by key.

```js
const articles = await this.$content('articles').sortBy('title').fetch()
```

> Can be chained multiple times to sort on multiple fields.

### limit(n)

- `n`
  - Type: `String` | `Number`
  - `required`

Limit number of results.

```js
// fetch only 5 articles
const articles = await this.$content('articles').limit(5).fetch()
```

### skip(n)

- `n`
  - Type: `String` | `Number`
  - `required`

Skip results.

```js
// fetch the next 5 articles
const articles = await this.$content('articles').skip(5).limit(5).fetch()
```

### search(field, value)

- `field`
  - Type: `String`
  - `required`
- `value`
  - Type: `String`

Performs a full-text search on a field. `value` is optional, in this case `field` is the `value` and search will be performed on all defined full-text search fields.

The fields you want to search on must be defined in options in order to be indexed, see [configuration](/configuration#fulltextsearchfields).

```js
// Search on field title
const articles = await this.$content('articles').search('title', 'welcome').fetch()
// Search on all pre-defined fields
const articles = await this.$content('articles').search('welcome').fetch()
```

### surround(slug, options)

- `slug`
  - Type: `String`
  - `required`
- `options`
  - Type: `Object`
  - Default: `{ before: 1, after: 1}`

Get prev and next results arround a specific slug.

You will always obtain an array of fixed length filled with the maching document or `null`.

```js
const [prev, next] = await this.$content('articles')
  .only(['title', 'path'])
  .sortBy('date')
  .where({ isArchived: false })
  .surround('article-2')
  .fetch()

// Returns
[
  {
    title: 'Article 1',
    path: 'article-1'
  },
  null // no article-3 here
]
```

> `search`, `limit` and `skip` are ineffective when using this method.

### fetch()

- Returns: `Promise<Object>` | `Promise<Array>`

Ends the chain sequence and collects data.

## Example

```js
const articles = await this.$content('articles')
  .only(['title', 'date', 'authors'])
  .sortBy('date', 'asc')
  .limit(5)
  .skip(10)
  .where({
    tags: 'testing',
    isArchived: false,
    date: { $gt: new Date(2020) },
    rating: { $gte: 3 }
  })
  .search('welcome')
  .fetch()
```

## API

This module exposes an API in development so you can easily see the JSON of each directory or file, it is available on [http://localhost:3000/_content/](http://localhost:3000/_content/). The prefix is `_content` by default and can be configured with the [apiPrefix](/configuration#apiprefix) property.

Example:

```bash
-| content/
---| articles/
------| hello-world.md
---| index.md
---| settings.json
```

Will expose on `localhost:3000`:
- `/_content/articles`: list the files in `content/articles/`
- `/_content/articles/hello-world`: get `hello-world.md` as JSON
- `/_content/index`: get `index.md` as JSON
- `/_content/settings`: get `settings.json` as JSON
- `/_content`: list `index` and `settings`

The endpoint is accessible on `GET` and `POST` request, so you can use query params: [http://localhost:3000/_content/articles?only=title&only=description&limit=10](http://localhost:3000/_content/articles?only=title&only=description&limit=10).

Since **v1.4.0**, this endpoint also support `where` in query params:

- All the keys that doesn't belong to any of the default ones will be applied to `where`

`http://localhost:3000/_content/articles?author=...`

- You can use `$operators` with `_`:

`http://localhost:3000/_content/articles?author_regex=...`

> This module uses LokiJS under the hood, you can check for [query examples](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

- You can use [nested properties](/configuration#nestedproperties):

`http://localhost:3000/_content/products?categories.slug_contains=top`

> You can learn more about that endpoint in [lib/middleware.js](https://github.com/nuxt/content/blob/master/lib/middleware.js).
