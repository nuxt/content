---
title: Docs Theme
subtitle: 'Create a beautiful documentation like this website in seconds ✨'
menuTitle: Docs
description: 'Create your documentation with @nuxt/content docs theme in seconds!'
category: Themes
position: 8
version: 1.2
badge: 'v0.8.1'
showcases:
  - https://strapi.nuxtjs.org
  - https://tailwindcss.nuxtjs.org
  - https://storybook.nuxtjs.org
  - https://firebase.nuxtjs.org
  - https://pwa.nuxtjs.org
  - https://image.nuxtjs.org
  - https://http.nuxtjs.org
  - https://cloudinary.nuxtjs.org
  - https://i18n.nuxtjs.org
  - https://snipcart.nuxtjs.org
  - https://prismic.nuxtjs.org
  - https://google-analytics.nuxtjs.org
  - https://color-mode.nuxtjs.org
  - https://mdx.nuxtjs.org
  - https://sanity.nuxtjs.org
  - https://speedcurve.nuxtjs.org
---

<alert type="info">

Checkout the [live example](/examples/docs-theme)

</alert>

## Getting Started

To get started quickly you can use the [create-nuxt-content-docs](https://github.com/nuxt/content/tree/dev/packages/create-nuxt-content-docs) package.

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn create nuxt-content-docs <project-name>
  ```

  </code-block>
  <code-block label="NPX">

  ```bash
  # Make sure you have npx installed (npx is shipped by default since NPM 5.2.0) or npm v6.1 or yarn.
  npx create-nuxt-content-docs <project-name>
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  # Starting with npm v6.1 you can do:
  npm init nuxt-content-docs <project-name>
  ```

  </code-block>
</code-group>

It will ask you some questions (name, title, url, repository, etc.), when answered the dependencies will be installed. The next step is to navigate to the project folder and launch it:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  cd <project-name>
  yarn dev
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  cd <project-name>
  npm run dev
  ```

  </code-block>
</code-group>

The application is now running on [http://localhost:3000](http://localhost:3000). Well done!

## Manual Setup

Let's say we're creating the documentation of an open-source project in the `docs/` directory.

The theme is a classic NuxtJS app, you need:

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
    "@nuxt/content-theme-docs": "^0.1.3",
    "nuxt": "^2.14.0"
  }
}
```

### `nuxt.config.js`

Import the theme function from `@nuxt/content-theme-docs`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  // [additional nuxt configuration]
})
```

The theme exports a function to setup the `nuxt.config.js` and allows you to add / override the default config.

> Check out the documentation of [defu.arrayFn](https://github.com/nuxt-contrib/defu#array-function-merger) to see how the config is merged.

**Example**

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  docs: {
    primaryColor: '#E24F55'
  },
  loading: { color: '#00CD81' },
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

<alert type="warning">

Don't forget to install the dependencies of the modules you add in your `nuxt.config.js`

</alert>

### `tailwind.config.js`

<badge>v0.4.0+</badge>

You can override the [default theme config](https://github.com/nuxt/content/blob/dev/packages/theme-docs/src/tailwind.config.js) by creating your own `tailwind.config.js`.

The theme design is based on a `primary` color to make it easy to override.

> Default colors are generated using [theme-colors](https://github.com/nuxt-contrib/theme-colors) with `docs.primaryColor` as base. <badge>v0.7.0+</badge>

**Example**

```js[tailwind.config.js]
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // ...
        }
      }
    }
  }
}
```

### `content/`

This is where you put your markdown content files. You can learn more in the following section.

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
  icon.png
nuxt.config.js
package.json
```

## Content

Once you've setup your documentation, you can directly start writing your content.

> Check out the documentation on [writing markdown content](/writing#markdown)

### Locales

The first level of directories in the `content/` folder are the locales used with [nuxt-i18n](https://github.com/nuxt-community/i18n-module) defined in your `nuxt.config.js`. By default there is only the default `en` locale defined, you have to create a `content/en/` directory to make it work.

You can override the locales in your `nuxt.config.js`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
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
  }
})
```

<alert type="warning">

As explained in [nuxt.config.js](/themes/docs#nuxtconfigjs) section, we use `defu.arrayFn` to merge your config. You can override the `i18n.locales` array by using a function, or you can pass an array to concat with the default one (which has only the `en` locale).

</alert>

### Routing

Each markdown page in the `content/{locale}/` directory will become a page and will be listed in the left navigation.

> You can also put your markdown files in subdirectories to generate sub-routes. <badge>v0.4.0+</badge>

**Example**

```
content/
  en/
    examples/
      basic-usage.md
    setup.md
```

**Result**

```
/examples/basic-usage
/setup
```

> You can take a look at our [docs content folder](https://github.com/nuxt/content/tree/dev/docs/content/en) to have an example

### Front-matter

To make it work properly, make sure to include these properties in the front-matter section of your markdown files.

#### Required fields

- `title` (`String`)
  - The title of the page will be injected in metas
- `description` (`String`)
  - The description of the page will be injected in metas
- `position` (`Number`)
  - This will be used to sort the documents in the navigation

#### Optional fields

- `category` (`String`)
  - This will be used to group the documents in the navigation
- `version` (`Float`)
  - Alert users that the page is new with a badge. Once the page is seen, the version is stored in the local storage until you increment it
- `fullscreen` (`Boolean`)
  - Grows the page and hides the table of contents
- `menuTitle` (`String`) <badge>v0.4.0+</badge>
  - Overwrites the title of the page that will be displayed in the left menu (defaults to `title`)
- `subtitle` (`String`) <badge>v0.5.0+</badge>
  - Adds a subtitle under the page title
- `badge` (`String`) <badge>v0.5.0+</badge>
  - Adds a badge next to the page title

### Example

```bash[content/en/index.md]
---
title: 'Introduction'
description: 'Empower your NuxtJS application with this awesome module.'
position: 1
category: 'Getting started'
version: 1.4
fullscreen: false
menuTitle: 'Intro'
---

Introducing my awesome Nuxt module!
```

## Settings

You can create a `content/settings.json` file to configure the theme.

### Properties

- `title` (`String`)
  - The title of your documentation
- `url` (`String`)
  - The url where your documentation will be deployed
- `logo` (`String` | `Object`)
  - The logo of your project, can be an `Object` to set a logo per [color mode](https://github.com/nuxt-community/color-mode-module)
- `github` (`String`)
  - The GitHub repository of your project `owner/name` to display the last version, the releases page, the link at the top and the `Edit this page on GitHub link` on each page Example: `nuxt/content`.
  - For GitHub Enterprise, you have to assign a full url of your project without a trailing slash. Example: `https://hostname/repos/owner/name`. <badge>v0.6.0+</badge>
- `githubApi` (`String`) <badge>v0.6.0+</badge>
  - For GitHub Enterprise, in addition to `github`, you have to assign a API full url of your project without a trailing slash. Example: `https://hostname/api/v3/repos/owner/name`.
  - Releases are fetched from `${githubApi}/releases`.
- `twitter` (`String`)
  - The Twitter username `@username` you want to link. Example: `@nuxt_js`
- `defaultBranch` (`String`) <badge>v0.2.0+</badge>
  - The default branch for the GitHub repository of your project, used in the `Edit this page on GitHub link` on each page (defaults to `main` if it cannot be detected).
- `defaultDir` (`String`) <badge>v0.6.0+</badge>
  - The default dir of your project, used in the `Edit this page on GitHub link` on each page (defaults to `docs`. Can be an empty string eg. `""`).
- `layout` (`String`) <badge>v0.4.0+</badge>
  - The layout of your documentation (defaults to `default`). Can be changed to `single` to have a one-page doc.
- `algolia` (`Object`) <badge>v0.7.0+</badge>
  - This option allows you to use [Algolia DocSearch](https://docsearch.algolia.com) to replace the simple built-in search. In order to enable it, you need to provide at least the `apiKey` and the `indexName`:
    ```json
    "algolia": {
        "apiKey": "<API_KEY>",
        "indexName": "<INDEX_NAME>",
        "langAttribute": "language"
    }
    ```
  - If you use `i18n`, make sure the `<langAttribute>` is the same as the html lang selector in the config (defaults to `language`).
  - Take a look at the [@nuxt/content](https://github.com/algolia/docsearch-configs/blob/master/configs/nuxtjs_content.json) docsearch config for an example.

### Example

```json[content/settings.json]
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

## Images

You can apply `dark-img` and `light-img` classes to your images when you have two versions to automatically swap dependending on the color mode.

**Example**

```md
<img src="/logo-light.svg" class="light-img" alt="Logo light" />
<img src="/logo-dark.svg" class="dark-img" alt="Logo dark" />
```

**Result**

<img src="/logo-light.svg" class="light-img" alt="Logo light" />
<img src="/logo-dark.svg" class="dark-img" alt="Logo dark" />

<p class="flex items-center">Try switching between light and dark mode:&nbsp;<app-color-switcher class="inline-flex ml-2"></app-color-switcher></p>

## Components

The theme comes with some default Vue.js components you can use directly in your markdown content.

> You can create your own components in the `components/global/` folder, check out [this section](/writing#vue-components). <badge>v0.3.0+</badge>

### `<alert>`

**Props**

- `type`
  - Type: `String`
  - Default: `'info'`
  - Values: `['info', 'success', 'warning', 'danger']`

**Example**

```md
<alert>

Check out an info alert with a `codeblock` and a [link](/themes/docs)!

</alert>
```

**Result**

<alert>

Check out an info alert with a `codeblock` and a [link](/themes/docs)!

</alert>

### `<list>`

**Props**

- `items`
  - Type: `Array`
  - Default: `[]`
- `type` <badge>v0.7.0+</badge>
  - Type: `String`
  - Default: `'primary'`
  - Values: `['primary', 'info', 'success', 'warning', 'danger']`
- `icon` <badge>v0.7.0+</badge>
  - Type: `String`
  - *Can be used to override the default `type` icon, check out the [icons available](https://github.com/nuxt/content/tree/dev/packages/theme-docs/src/components/global/icons)*

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


### `<badge>`

<badge>v0.5.0+</badge>

**Example**

```md
<badge>v1.2+</badge>
```

**Result**

<badge>v1.2+</badge>

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

## Showcases

<showcases :showcases="showcases"></showcases>
