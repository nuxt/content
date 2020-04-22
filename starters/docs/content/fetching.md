---
title: Fetching content
position: 4
category: Getting started
---

This module globally injects `$content` instance, meaning that you can access it anywhere using `this.$content`. For plugins, asyncData, fetch, nuxtServerInit and Middleware, you can access it from `context.$content`.

## Methods

### `$content(path)`

- Returns a chain sequence

`path` can be a file or a directory. Defaults to `/`. All the methods below can be chained and return a chain sequence (except `fetch`).

### `only(keys)`

Select a subset of fields.

```js
await this.$content().only(['title']).fetch()
```

### `where(query)`

Filter a query.

```js
await this.$content().where({ title: 'Home' }).fetch()
```

This module uses LokiJS under the hood, you can check for [query examples](http://techfort.github.io/LokiJS/tutorial-Query%20Examples.html).

### `sortBy(field, direction)`

Sort results by field. `direction` defaults to `asc` (ascending order). Can be chained multiple times to sort on multiple fields.

```js
await this.$content().sortBy('title').fetch()
```

### `limit(n)`

Limit number of results. `n` can be a string or a number.

### `skip(n)`

Skip results. `n` can be a string or a number.

### `search(field, value)`

Performs a full-text search on a field. `value` is optional, in this case `field` is the `value` and search will be performed on all full-text search fields.

The fields you want to search on must be defined in options in order to be indexed, see [configuration](/configuration#fulltextsearchfields).

```js
// Search on field title
await this.$content('articles').search('title', 'welcome').fetch()
// Search on all pre-defined fields
await this.$content('articles').search('welcome').fetch()
```

You can also pass a full Query DSL object as first parameter:

```js
const articles = await this.$content('articles')
  .search({
    query: {
      type: 'match',
      field: 'title',
      value: 'welcome',
      prefix_length: 1,
      fuzziness: 1,
      extended: true,
      minimum_should_match: 1
    }
  })
  .fetch()
```

### `surround(slug, options)`

Get prev and next results arround a specific slug. `options` defaults to `{ before: 1, after: 1}`.

You will always obtain an array of fixed length filled with null values.

> `only`, `limit` and `skip` are ineffective when using this method.

```js
const [ prev, next ] = await this.$content('articles')
  .only(['title', 'path'])
  .sortBy('date')
  .surround('article-2')
  .where({ isArchived: false })
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

### `fetch()`

- Returns: `Promise`

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