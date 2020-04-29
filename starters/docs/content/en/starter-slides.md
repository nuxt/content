---
title: Slides
category: Starters
position: 9
---

This starter is a [Nuxt.js](https://nuxtjs.org) app using **@nuxtjs/content**. It allows to quickly start writing slides.

You can see a showcase here.

## Usage

The easiest way to use this starter is to download the subdirectory of the Github repository.

You can do so with `degit`:

```bash
npx degit https://github.com/nuxt-company/content-module/tree/master/starters/slides slides
```

Go into the created folder and install it:

```base
cd slides
yarn
```

Start the Nuxt.js app:

```bash
yarn dev
```

You can then start writing in the `content` folder, you have nothing to configure.

## Features

### Next and Previous Navigation

By using left / right click or arrow keys you can navigate through the slides.

This navigation is automatically generated from calling the `surround` method:

```js
const [prev, next] = await this.$content()
  .only(['title', 'slug'])
  .sortBy('position', 'asc')
  .surround(params.slug, { before: 1, after: 1 })
  .fetch()
```

To use this system, you need to add `position` to your content files.

```md
---
title: Introduction
position: 1
---
```

### Transitions

When navigating across slides, a slide transition is already implemented using Nuxt.js [page transition](https://nuxtjs.org/api/pages-transition#function), you can customize it in the `tailwind.css` file located in `~/assets/css`.

### Dark mode

Dark mode is everywhere nowadays. Thanks to [color-mode-module](https://github.com/nuxt-community/color-mode-module), it is easily implemented into this starter. Click the icon at the top of the page and try it out for yourself!

### TailwindCSS

This starter uses [TailwindCSS](https://tailwindcss.com/) for its layouts and styles. Thanks to [tailwindcss-module](https://github.com/nuxt-community/tailwindcss-module), verything is already configured including [PurgeCSS](https://purgecss.com/) to keep the bundle size as low as possible and the website fast and snappy!

You can easily configure it by editing the `tailwind.config.js` file.

## Make it your own

This starter is just a one Nuxt.js app, you can easily start building on it.

Don't like how something was designed or implemented? Just change the code and make it your way.

## Contribute

Feel free to open a [pull request](https://github.com/nuxt-company/content-module/pulls).
