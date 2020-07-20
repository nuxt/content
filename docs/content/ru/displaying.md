---
title: Отображение контента
description: 'Вы можете использовать компонент `<nuxt-content>` непосредственно в шаблоне для отображения вашего Markdown.'
position: 5
category: Начало
---

<base-alert type="info">Этот раздел только для Markdown файлов.</base-alert>

## Component

Вы можете использовать компонент `<nuxt-content>` непосредственно в шаблоне для отображения тела страницы:

```vue
<template>
  <article>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </article>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fetch()

    return {
      page
    }
  }
}
</script>
```


**Входные параметры:**
- document:
  - Тип: `Object`
  - `обязательное`

Изучите больше о том, что вы можете писать в вашем markdown файле в разделе [написание контента](/writing#markdown).

## Стили

В зависимости от того, что вы используете для разработки своего приложения, вам может потребоваться написать стили для правильного отображения markdown.

Компонент `<nuxt-content>` автоматически добавит класс `.nuxt-content` и вы сможете использовать его для стилизации:

```css
.nuxt-content h1 {
  /* мои пользовательские стили для h1 */
}
```

Вы можете найти примеры в [директории документации](https://github.com/nuxt/content/blob/master/docs/pages/_slug.vue).

## Редактирование контента в реальном времени

> Доступно с версии **>= v1.4.0**

**В режиме разработки** вы можете редактировать контент **дважды кликнув** на компонент `<nuxt-content>`. В области текста вы сможете редактировать контент текущего файла и изменения будут сохранены на диске.

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content-ui_otfj5y.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content-ui_otfj5y.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1592314331/nuxt-content-ui_otfj5y.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content-ui_otfj5y.ogv" type="video/ogg" />
</video>
