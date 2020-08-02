---
title: Документация
description: 'Создайте собственную документацию вместе с темой документации @nuxt/content за несколько минут.'
category: Темы
position: 8
version: 1
---

<alert type="info">

Изучите первую тему для `@nuxt/content`.

Создайте прекрасную документацию, как этот сайт, за несколько минут.

</alert>

> Попробуйте пример в [песочнице](/playground#docs-theme)

Представим, что мы создаем документацию для проекта с открытым исходным кодом в директории `docs/`

## Установка

Как и классическому приложению NuxtJS для темы понадобится:

### `package.json`

> Этот файл будет создан при выполнении `npm init`.

Установить `nuxt` и `@nuxt/content-theme-docs`:

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

**Пример**

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

Импортировать функцию темы из `@nuxt/content-theme-docs`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme()
```

Тема экспортирует функцию для установки в `nuxt.config.js` и позволяет добавить или перезаписать стандартную конфигурацию.

> Взгляните на документацию [defu.fn](https://github.com/nuxt-contrib/defu#function-merger) чтобы понять как будут объединены конфигурации.

**Пример**

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

Не забудьте установить зависимости модулей, которые вы добавили в ваш `nuxt.config.js`

</alert>

### `content/`

Вам нужно создать поддиректорию `content/en/` чтобы начать использовать [nuxt-i18n](https://github.com/nuxt-community/i18n-module) и язык по молчанию `en`. Теперь вы можете начать писать ваши markdown файлы.

### `static/`

В эту директорию вы должны помещать статические файлы, например, логотип.

<alert type="info">

Вам нужно добавить файл `static/icon.png` чтобы включить [nuxt-pwa](https://pwa.nuxtjs.org/) и автоматически сгенерировался favicon.

*Иконка должна быть квадратом не менее 512x512 пикселей*

</alert>

<alert type="info">

Вы можете добавить файл `static/preview.png` чтобы получить изображения предварительного просмотра для социальных сетей в ваших мета-тегах.

*Изображение должно быть не менее 640×320 пикселей (1280×640 пикселей для лучшего отображения).*

</alert>

**Пример**

```bash
content/
  en/
    index.md
static/
  icon.png
nuxt.config.js
package.json
```

## Контент

Каждый markdown файл в директории `content/` станет страницей и будет отображаться в навигации слева.

Чтобы все работало правильно вам нужно добавить эти свойства в начале вашего файла:

- `title`
  - Тип: `String`
  - `обязательное`
  - *Заголовок будет добавлен в мета-теги*
- `description`
  - Тип: `String`
  - `обязательное`
  - *Описание будет добавлено в мета-теги*
- `position`
  - Тип: `Number`
  - `обязательное`
  - *Будет использовано для сортировки документов в навигации*
- `category`
  - Тип: `String`
  - `обязательное`
  - *Будет использовано для группировки документов в меню*
- `version`
  - Тип: `Float`
  - *Можно использовать, чтобы сообщить пользователям о новых страницах. Как только вы посетите страницу, версия будет храниться в local storage пока вы не увеличите ее.*
- `fullscreen`
  - Тип: `Boolean`
  - *Можно использовать для того, чтобы увеличить страницу и спрятать блок `содержания`*

**Пример**

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

## Настройки

Вы можете создать файл `content/settings.json` чтобы настроить тему:

- `title`
  - Тип: `String`
  - *Заголовок вашей документации*
- `url`
  - Тип: `String`
  - *Ссылка, где будет расположена документация*
- `logo`
  - Тип: `String` | `Object`
  - *Логотип вашей документации, может быть `Object` для установки на каждый [цветовой режим](https://github.com/nuxt-community/color-mode-module)*
- `github`
  - Тип: `String`
  - *GitHub репозиторий вашего проекта `${org}/${name}` для отображения последней версии, страницы изменений, ссылки вверху и ссылки `Редактировать эту страницу на GitHub` на каждой странице*
- `defaultBranch`
  - Тип: `String`
  - *Ветка вашего проекта, которая используется по умолчанию , используется для ссылки `Редактировать эту страницу на GitHub` на каждой странице (по умолчанию `main` если ничего не задано).*
- `twitter`
  - Тип: `String`
  - *Ваше имя пользователя на twitter*

**Пример**

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

## Компоненты

Вы можете создавать собственные компоненты помещая их в директорию `components/global/`, взгляните на этот [раздел](/writing#vue-components).

Также, в теме есть несколько стандартных Vue.js компонентов, которые вы можете использовать в вашем markdown

### `<alert>`

**Входные параметры**

- `type`
  - Тип: `String`
  - По умолчанию: `'warning'`
  - Значения: `['warning', 'info']`

**Пример**

```md
<alert>

Взгляните на предупреждение с `блоком кода`!

</alert>
```

**Результат**

<alert>

Взгляните на предупреждение с `блоком кода`!

</alert>

**Пример**

```md
<alert type="info">

Взгляните на информационное предупреждение со [ссылкой](/themes-docs).

</alert>
```

**Результат**

<alert type="info">

Взгляните на информационное предупреждение со [ссылкой](/themes-docs).

</alert>

### `<list>`

**Входные параметры**

- `items`
  - Тип: `Array`
  - По умолчанию: `[]`

**Пример**

```md
---
items:
  - Item1
  - Item2
  - Item3
---

<list :items="items"></list>
```

**Результат**

<list :items="['Item1', 'Item2', 'Item3']"></list>

### `<code-group>`

Этот компонент использует `slots`, относящийся к `code-block` ниже.

### `<code-block>`

**Входные параметры**

- `label`
  - Тип: `String`
  - `required`
- `active`
  - Тип: `Boolean`
  - По умолчанию: `false`

**Пример**

```html
# Обратные слеши для демонстрации

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

**Результат**

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

**Входные параметры**

- `src`
  - Тип: `String`
  - `required`

**Пример**

```md
---
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

<code-sandbox :src="link"></code-sandbox>
```

**Результат**

<code-sandbox src="https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark"></code-sandbox>

## Изображения

Вы можете применять классы `dark-img` и `light-img` к вашим изображениям когда у вас есть две версии, для автоматической замены при смене цветового режима.

**Пример**

```md
<img src="/logo-light.svg" class="light-img" alt="Светлый логотип" />
<img src="/logo-dark.svg" class="dark-img" alt="Темный логотип" />
```

**Результат**

<img src="/logo-light.svg" class="light-img" alt="Светлый логотип" />
<img src="/logo-dark.svg" class="dark-img" alt="Темный логотип" />

<p class="flex items-center">Используйте для переключения светлого и темного режимов:&nbsp;<app-color-switcher class="inline-flex ml-2"></app-color-switcher></p>
