---
title: Docs
description: 'Use a theme and accelerate your development with Nuxt and @nuxt/content.'
category: Themes
position: 8
version: 1.6
---

<alert type="info">

Discover the first `@nuxt/content` theme for documentation. Create a beautiful documentation like this website in seconds.

</alert>

Let's say we're creating the documentation of an open-source project in the `docs/` directory.

## Setup

The theme is like a classic NuxtJS app, you need:

### `package.json`

> This file can be created with `npm init`.

Install `nuxt` and `@nuxt/content-theme-docs`:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add nuxt @nuxt/content-theme-docs
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install nuxt @nuxt/content-theme-docs
  ```

  </code-block>
</code-group>

**Example**

```json[package.json]
{
  "name": "docs",
  "version": "1.0.0",
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate"
  },
  "dependencies": {
    "@nuxt/content-theme-docs": "^0.1.1",
    "nuxt": "^2.14.0"
  }
}
```

### `nuxt.config.js`

Import the theme function from `@nuxt/content-theme-docs`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme()
```

The theme exports a function to setup the `nuxt.config.js` and allows you to add / override the default config.

> Check out the documentation of [defu.fn](https://github.com/nuxt-contrib/defu#function-merger) to see how the config is merged.

**Example**

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN
  },
  loading: { color: '#48bb78' },
  generate: {
    fallback: '404.html', // for Netlify
    routes: ['/'] // give the first url to start crawling
  },
  i18n: {
    locales: () => [{
      code: 'fr',
      iso: 'fr-FR',
      file: 'fr-FR.js',
      name: 'Français'
    }, {
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en'
  },
  buildModules: [
    ['@nuxtjs/google-analytics', {
      id: 'UA-12301-2'
    }]
  ]
})
```

<alert>

Don't forget to install the dependencies of the modules you add in your `nuxt.config.js`

</alert>

### `content/`

You need to create a `content/en/` subdirectory since the theme uses [nuxt-i18n](https://github.com/nuxt-community/i18n-module) and defaults to `en` locale. You can then start writing your markdown files.

### `static/`

This is where you put your static assets like the logo.

<alert type="info">

You can add a `static/icon.png` file to enable [nuxt-pwa](https://pwa.nuxtjs.org/) and generate a favicon automatically.

*Icon should be a square of at least 512x512*

</alert>

<alert type="info">

You can add a `static/preview.png` file to have a social preview image in your metas.

*Image should be at least 640×320px (1280×640px for best display).*

</alert>

**Example**

```bash
content/
  en/
    index.md
static/
  favicon.ico
nuxt.config.js
package.json
```

## Content

Each markdown page in the `content/` directory will become a page and will be listed in the left navigation.

To make it work properly, make sure to include these properties in the front-matter section:

- `title`
  - Type: `String`
  - `required`
  - *The title of the page will be injected in metas*
- `description`
  - Type: `String`
  - `required`
  - *The description of the page will be injected in metas*
- `position`
  - Type: `Number`
  - `required`
  - *This will be used to sort the documents in the navigation*
- `category`
  - Type: `String`
  - `required`
  - *This will be used to group the documents in the navigation*
- `version`
  - Type: `Float`
  - *This can used to alert users that this document is new with a badge. Once the page is seen, the version is stored in the local storage until you increment it.*
- `fullscreen`
  - Type: `Boolean`
  - *This can be used to grow a page when there is no `toc`*

**Example**

```md
---
title: Introduction
description: 'Empower your NuxtJS application with @nuxt/content module.'
position: 1
category: Getting started
version: 1.4
fullscreen: false
---
```

## Settings

You can create a `content/settings.json` file to configure the theme:

- `title`
  - Type: `String`
  - *The title of your documentation*
- `url`
  - Type: `String`
  - *The url where your documentation will be deployed*
- `logo`
  - Type: `String` | `Object`
  - *The logo of your project, can be an `Object` to set a logo per [color mode](https://github.com/nuxt-community/color-mode-module)*
- `github`
  - Type: `String`
  - *The GitHub repository of your project `${org}/${name}` to display the last version, the releases page, the link at the top and the `Edit this page on GitHub link` on each page*
- `twitter`
  - Type: `String`
  - *The Twitter username you want to link*

**Example**

```json
{
  "title": "Nuxt Content",
  "url": "https://content.nuxtjs.org",
  "logo": {
    "light": "/logo-light.svg",
    "dark": "/logo-dark.svg"
  },
  "github": "nuxt/content",
  "twitter": "@nuxt_js"
}
```

## Components

The theme comes with some Vue.js components you can use directly in your markdown content:

### `<alert>`

**Props**

- `type`
  - Type: `String`
  - Default: `'warning'`
  - Values: `['warning', 'info']`

**Example**

```md
<alert>

Check out a warning alert with a `codeblock`!

</alert>
```

**Result**

<alert>

Check out a warning alert with a `codeblock`!

</alert>

**Example**

```md
<alert type="info">

Check out an info alert with a [link](/themes-docs).

</alert>
```

**Result**

<alert type="info">

Check out an info alert with a [link](/themes-docs).

</alert>

### `<list>`

**Props**

- `items`
  - Type: `Array`
  - Default: `[]`

**Example**

```md
---
items:
  - Item1
  - Item2
  - Item3
---

<list :items="items"></list>
```

**Result**

<list :items="['Item1', 'Item2', 'Item3']"></list>

### `<code-group>`

This component uses `slots`, refer to `code-block` below.

### `<code-block>`

**Props**

- `label`
  - Type: `String`
  - `required`
- `active`
  - Type: `Boolean`
  - Default: `false`

**Example**

```html
# Backslashes are for demonstration

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content-theme-docs
  \```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content-theme-docs
  \```

  </code-block>
</code-group>
```

**Result**

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content-theme-docs
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content-theme-docs
  ```

  </code-block>
</code-group>

### `<code-sandbox>`

**Props**

- `src`
  - Type: `String`
  - `required`

**Example**

```md
---
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

<code-sandbox :src="link"></code-sandbox>
```

**Result**

<code-sandbox src="https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark"></code-sandbox>

## Images

You can apply `dark-img` and `light-img` classes to your images when you have two versions to automatically swap dependending on the color mode.

**Example**

```md
<img src="/img-light.svg" class="light-img" alt="Image light" />
<img src="/img-dark.svg" class="dark-img" alt="Image dark" />
```