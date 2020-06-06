---
title: Установка
description: 'Установка @nuxt/content в ваш проект Nuxt всего за пару шагов.'
category: Начало
position: 2
---

Добавьте `@nuxt/content` как зависимость в ваш проект:

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

Затем, добавьте `@nuxt/content` в секцию `modules` вашего `nuxt.config.js`:

```js[nuxt.config.js]
{
  modules: [
    '@nuxt/content'
  ],
  content: {
    // Параметры
  }
}
```

## TypeScript

Добавьте типы в ваш список "types" в tsconfig.json после `@nuxt/types` (Nuxt 2.9.0+) или `@nuxt/vue-app` записей.

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

> **Почему?**
>
> Из-за особенностей работы Nuxt, свойство `$content` в контексте должно быть объединено с интерфейсом nuxt `Context` через [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html). Добавление `@nuxt/content` в ваши типы импортирует типы из пакета и даст знать typescript о дополнениях в интерфейс `Context`.
