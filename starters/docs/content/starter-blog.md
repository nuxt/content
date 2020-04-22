---
title: Blog
category: Starters
position: 10
---

This starter is a [Nuxt.js](https://nuxtjs.org) app using **@nuxtjs/content**. It allows to quickly start writing a blog.

You can see a showcase here.

Inspired by [gridsome-starter-blog](https://github.com/gridsome/gridsome-starter-blog).

## Usage

The easiest way to use this starter is to download the subdirectory of the Github repository.

You can do so with `degit`:

```bash
npx degit https://github.com/nuxt-company/content-module/tree/master/starters/blog blog
```

Go into the created folder and install it:

```base
cd blog
yarn
```

Start the Nuxt.js app:

```bash
yarn dev
```

You can then start writing in the `content` folder, you have nothing to configure.

## Features

### Next and Previous Navigation

If you scroll to the bottom of an article, you will notice some links to the previous and next pages.

These links are automatically generated from calling the `surround` method:

```js
const [prev, next] = await this.$content()
  .only(['title', 'slug'])
  .sortBy('position', 'asc')
  .surround(params.slug, { before: 1, after: 1 })
  .fetch()
```

### Table of contents

On the right side of an article is an overview of every headline (h2, h3) of the current page.

This list is returned in the `toc` property by the API when fetching a single document.

```js
const { title, body, toc } = await this.$content(params.slug).fetch()
```

### Dark mode

Dark mode is everywhere nowadays. Thanks to [color-mode-module](https://github.com/nuxt-community/color-mode-module), it is easily implemented into this starter. Click the icon at the top of the page and try it out for yourself!

### TailwindCSS

This starter uses [TailwindCSS](https://tailwindcss.com/) for its layouts and styles. Thanks to [tailwindcss-module](https://github.com/nuxt-community/tailwindcss-module), verything is already configured including [PurgeCSS](https://purgecss.com/) to keep the bundle size as low as possible and the website fast and snappy!

You can easily configure it by editing the `tailwind.config.js` file.

## Make it your own

This starter is just a two-page Nuxt.js app, you can easily start building on it.

Don't like how something was designed or implemented? Just change the code and make it your way.

## Contribute

Feel free to open a [pull request](https://github.com/nuxt-company/content-module/pulls).
