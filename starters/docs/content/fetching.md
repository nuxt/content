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

### `fields()`

Select a subset of fields:

```js
await $content().fields(['title']).fetch()
```

### `where(query)`

Filter a query:

```js
await $content().where({ title: 'Home' })
```

`@nuxtjs/content` uses LokiJS under the hood, you can check for [query examples](http://techfort.github.io/LokiJS/tutorial-Query%20Examples.html).

### `sortBy()`

### `limit(n)`

Limit number of results. `n` can be a string or a number.

### `skip(n)`

Skip results. `n` can be a string or a number.

### `search(field, value)`

### `surround(slug, options)`

### `fetch()`

- Returns: `Promise`

You need to call `fetch` in order to get data.