---
title: Installation
description: 'Install @nuxt/content in only two steps in your Nuxt project.'
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

```js[nuxt.config.js]
{
  modules: [
    '@nuxt/content'
  ],
  content: {
    // Options
  }
}
```

## TypeScript

Add the types to your "types" array in tsconfig.json after the `@nuxt/types` (Nuxt 2.9.0+) or `@nuxt/vue-app` entry.

**tsconfig.json**

```json
{
  "compilerOptions": {
    "types": [
      "@nuxt/types",
      "@nuxt/content"
    ]
  }
}
```

> **Why?**
>
> Because of the way nuxt works the `$content` property on the context has to be merged into the nuxt `Context` interface via [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html). Adding `@nuxt/content` to your types will import the types from the package and make typescript aware of the additions to the `Context` interface.