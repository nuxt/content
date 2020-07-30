---
title: Themes
description: 'Use a theme and accelerate your development with Nuxt and @nuxt/content.'
category: Community
position: 12
---

## Docs

Create a beautiful documentation like this website in seconds.

### Setup

In the `docs` folder of you project, you need:

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
