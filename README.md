# @nuxtjs/content

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> Write your content inside your Nuxt app

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add `@nuxtjs/content` dependency to your project

```bash
yarn add @nuxtjs/content # or npm install @nuxtjs/content
```

2. Add `@nuxtjs/content` to the `modules` section of `nuxt.config.js`

```js
{
  modules: [
    // Simple usage
    '@nuxtjs/content'
  ]
}
```

## Usage

Create a `content/` directory in your Nuxt project:

```
content/
  articles/
    article-1.md
    article-2.md
  home.md
```

### Methods

- `$content(DirectoryPath: string).fetch()` ⇒ `[{}]`
- `$content(FilePath: string).fetch()` ⇒ `{}`

### Example

`content/hello.md`

```md
----
title: Home page
---

# Home page

> Welcome to my *home page*!
```

`$content('hello').fetch()`

```json
{
  "dir": "",
  "slug": "hello",
  "path": "/hello",
  "updatedAt": "2017-11-07T12:21:34Z",
  "metadata": {
    "title": "Home page"
  },
  "body": {
    "type": "root",
    "children": [
      {
        "type": "heading",
        "depth": 1,
        "children": [
          {
            "type": "text",
            "value": "Home page"
          }
        ]
      },
      {
        "type": "blockquote",
        "children": [
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "value": "Welcome to my ",
              },
              {
                "type": "emphasis",
                "children": [
                  {
                    "type": "text",
                    "value": "home page",
                  }
                ]
              },
              {
                "type": "text",
                "value": "!"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

You can now use `this.$content(path)` in your Vue components:

```js
// Listing
const articles = await this.$content('articles')
	.fields(['title', 'date', 'authors'])
	.sortBy('date', 'asc')
	.limit(5)
  .skip(10)
  .where({
		tags: 'testing',
    isArchived: false,
		date: { $gt: new Date(2020) }, // v2
    rating: { $gte: 3 }, // v2
	})
  .search('slug:2019*') // Based on lunrjs.com/guides/searching.html#fields
	.fetch()
```

```js
// Listing
const articles = await this.$content('articles')
	.fields(['title', 'date', 'authors'])
	.sortBy('date', 'asc')
	.limit(5)
  .skip(10)
  .where({
		tags: 'testing',
    isArchived: false,
		date: { $gt: new Date(2020) }, // v2
    rating: { $gte: 3 }, // v2
	})
  .search('slug:2019*') // Based on lunrjs.com/guides/searching.html#fields
	.fetch()
```

```js
// Get previous and next article
const [ prev1, prev2, next1, next2, next3 ] = await this.$content('articles')
	.fields(['title', 'path'])
	.sortBy('date')  // desc (default 2nd params value)
  .surround('article-2', { before: 2, after: 3 }) // array.slice(start (indexOf(my-article) - before), end (1 + before + start))
  .where({ isArchived: false })
	.fetch()

// Returns
[
  null, // no article-0 here
	{
    title: 'Article 1',
		path: 'article-1'
	},
	null, // no article-3 here
  null, // no article-4 here
  null  // no article-5 here
]

// limit and offset are ineffective when using surround
// if slug is not found, will fill with null value each item
```

**Code example**

```js
<template>
  <article>
    <h1>{{ page.title }}</h1>
    <md-content :body="page.body"/>
  </article>
</template>

<script>
export default {
  data() {
    page: null,
    learn: null
  },
  fetch () {
    this.page = await this.$content(`${this.i18n.locale}/guide/installation`).fetch()
    this.learnSection = await this.$content(`${this.i18n.locale}/learn`)
      .fields(['title', 'metadata'])
      .sortBy('updatedAt', 'desc')
  }
}
</script>
```

Using global Vue component in Markdown is supported (see how [nuxt press does](https://nuxt.press/en/customize/#using-components)).

## Configuration

```js
// nuxt.config.js
export default {
  modules: ['@nuxtjs/content'],
  content: {
    dir: 'content',
    i18n: 'auto', // true or false
    apiPrefix: '__content', // http://localhost:3000/__content
  }
}
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `yarn dev` or `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) NuxtJS Company

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/content/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxtjs/content

[npm-downloads-src]: https://img.shields.io/npm/dt/@nuxtjs/content.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/content

[github-actions-ci-src]: https://github.com/nuxt-company/content-module/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/nuxt-company/content-module/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/github/nuxt-company/content-module.svg
[codecov-href]: https://codecov.io/gh/nuxt-company/content-module

[license-src]: https://img.shields.io/npm/l/@nuxtjs/content.svg
[license-href]: https://npmjs.com/package/@nuxtjs/content
