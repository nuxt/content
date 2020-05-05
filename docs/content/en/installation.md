---
title: Installation
category: Getting started
position: 2
---

Add `@nuxt/content` dependency to your project:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content
  ```

  </code-block>
</code-group>

Then, add `@nuxt/content` to the `modules` section of `nuxt.config.js`:

```js
{
  modules: [
    '@nuxt/content'
  ],
  content: {
    // Options
  }
}
```
