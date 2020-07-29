---
title: Используйте темы (в процессе)
description: 'Добавьте тему и ускорьте свою разработку с Nuxt и @nuxt/content.'
category: Темы
position: 8
---

<br>
<base-alert type="info">

  **Темы скоро появятся** в [NuxtJS](https://nuxtjs.org), следите за этим в нашем [Twitter](https://twitter.com/nuxt_js) или [GitHub](https://github.com/nuxt/nuxt.js).

</base-alert>

Установка будет выглядеть так:

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

Затем добавьте тему в ваш `nuxt.config.js`:

```js[nuxt.config.js]
export default {
  theme: '@nuxtjs/theme-everest'
}
```

Теперь вы можете писать в вашей директории `content/` и наслаждаться красивой документацией, блогом, сайтом-портфолио и многим другим!
