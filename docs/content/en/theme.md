---
title: Use a theme (WIP)
description: 'Add a theme and accelerate your development with Nuxt and @nuxt/content.'
category: Themes
position: 8
---

<br>
<base-alert type="info">

  **Themes are coming soon** to [NuxtJS](https://nuxtjs.org), stay up to date on our [Twitter](https://twitter.com/nuxt_js) or [GitHub](https://github.com/nuxt/nuxt.js).

</base-alert>

The setup will look like this:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxtjs/theme-everest
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxtjs/theme-everest
  ```

  </code-block>
</code-group>

Then add your theme in your `nuxt.config.js`:

```js[nuxt.config.js]
export default {
  theme: '@nuxtjs/theme-everest'
}
```

Finally you can start writing inside the `content/` directory and enjoy a beautiful documentation website, blog, portfolio, and more!
