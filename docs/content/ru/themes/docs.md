---
title: Тема документации
subtitle: 'Создайте прекрасную документацию, как этот сайт, за считанные секунды ✨'
menuTitle: Документация
description: 'Создайте собственную документацию вместе с темой документации @nuxt/content за несколько минут.'
category: Темы
position: 8
version: 1.3
badge: 'v0.9.0'
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

Ознакомьтесь с [онлайн примером](/examples/docs-theme)

</alert>

## Начало работы

Для быстрого старта вы можете использовать пакет [create-nuxt-content-docs](https://github.com/nuxt/content/tree/dev/packages/create-nuxt-content-docs).

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn create nuxt-content-docs <project-name>
  ```

  </code-block>
  <code-block label="NPX">

  ```bash
  # Убедитесь, что у вас установлен npx (npx входит в комплект поставки NPM с версии 5.2.0) или npm v6.1 или yarn.
  npx create-nuxt-content-docs <project-name>
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  # Начиная с npm v6.1 вы можете сделать так:
  npm init nuxt-content-docs <project-name>
  ```

  </code-block>
</code-group>

Вам будет предложено ответить на несколько вопросов (name, title, url, repository, и т.д.). Затем будут установлены необходимые зависимости. Следующий шаг - перейдите в папку проекта и запустите его:

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

Ваше приложение запустится на [http://localhost:3000](http://localhost:3000). Отличная работа!

## Ручная настройка

Представим, что мы создаем документацию для проекта с открытым исходным кодом в директории `docs/`

Как и классическому приложению NuxtJS для темы понадобится:

### `package.json`

> Этот файл будет создан при выполнении `npm init`.

Установите `nuxt` и `@nuxt/content-theme-docs`:

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
    "@nuxt/content-theme-docs": "^0.11.0",
    "nuxt": "^2.15.8"
  }
}
```

### `nuxt.config.js`

Импортируйте функцию theme из `@nuxt/content-theme-docs`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  // [дополнительная конфигурация nuxt]
})
```

Тема экспортирует функцию для настройки `nuxt.config.js` и позволяет добавить / перегрузить стандартную конфигурацию.

> Ознакомьтесь с документацией [defu.arrayFn](https://github.com/nuxt-contrib/defu#array-function-merger), чтобы понять, как будут объединены конфигурации.

**Пример**

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

Не забудьте установить зависимости модулей, которые вы добавили в ваш `nuxt.config.js`

</alert>

### `tailwind.config.js`

<badge>v0.4.0+</badge>

Вы можете перегрузить [дефолтную конфигурацию темы](https://github.com/nuxt/content/blob/dev/packages/theme-docs/src/tailwind.config.js), создав свой собственный `tailwind.config.js`.

Дизайн темы основан на `primary` цвете для удобства настройки.

> Дефолтные цвета сгенерированы с использованием [theme-colors](https://github.com/nuxt-contrib/theme-colors) с `docs.primaryColor` в качестве основы. <badge>v0.7.0+</badge>

**Пример**

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

Это директория для ваших markdown файлов. Вы можете узнать больше в следующей секции.

### `static/`

Эта директория для статических файлов, например, для логотипов.

<alert type="info">

Вы можете добавить файл `static/icon.png`, чтобы включить [nuxt-pwa](https://pwa.nuxtjs.org/) и автоматически сгенерировать favicon.

*Иконка должна быть квадратом не менее 512x512 пикселей*

</alert>

<alert type="info">

Вы можете добавить файл `static/preview.png` чтобы получить изображения предварительного просмотра для социальных сетей в ваших мета-тегах.

*Изображение должно быть не менее 640×320 пикселей (1280×640 пикселей для современных дисплеев).*

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

Теперь, когда вы настроили вашу документацию, вы можете приступать к написанию контента.

> Ознакомьтесь с документацией [написание контента на markdown](/writing#markdown)

### Локализация

Директории первого уровня в папке `content/` - это локали, используемые с [nuxt-i18n](https://github.com/nuxt-community/i18n-module), описанные в вашем `nuxt.config.js`. По умолчанию определена только `en` локаль. Вам нужно создать папку `content/en/` чтобы всё заработало.

Вы можете перегрузить локали в вашем `nuxt.config.js`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  i18n: {
    locales: () => [{
      code: 'ru',
      iso: 'ru-RU',
      file: 'ru-RU.js',
      name: 'Русский'
    }, {
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

Как разъяснено в секции [nuxt.config.js](/themes/docs#nuxtconfigjs), мы используем `defu.arrayFn` для слияния ваших конфигураций. Вы можете перегрузить массив `i18n.locales`, используя функцию, или вы можете задать массив для объединения с настройкой по умолчанию (которая содержит только локаль `en`).

</alert>

### Маршруты (Routing)

Каждый markdown файл в директории `content/` станет страницей и будет отображаться в навигации слева.

> Вы также можете организовать ваши markdown файлы в подпапках, чтобы сгенерировать вложенные маршруты. <badge>v0.4.0+</badge>

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

> Вы можете ознакомиться с [содержимым папки docs content](https://github.com/nuxt/content/tree/dev/docs/content/ru) в качестве примера

### Оглавление (Front-matter)

Чтобы все работало как надо, вам нужно добавить эти свойства в оглавление файла:

#### Обязательные поля

- `title` (`String`)
  - Заголовок будет добавлен в мета-теги
- `description` (`String`)
  - Описание будет добавлено в мета-теги
- `position` (`Number`)
  - Будет использовано для сортировки документов в навигации

#### Необязательные поля

- `category` (`String`)
  - Будет использовано для группировки документов в навигации (по умолчанию `""`)
  - Если `category` имеет _ложное_ (falsy) значение или не является строкой, оно будет приведено к `""` и не будет отображено в сайдбаре.
- `version` (`Float`)
  - Сообщает пользователю, что страница новая, с помощью бейджа. Как только вы посетите страницу, версия будет сохранена в local storage пока вы не увеличите ее
- `fullscreen` (`Boolean`)
  - Увеличивает страницу и прячет блок содержания
- `menuTitle` (`String`) <badge>v0.4.0+</badge>
  - Переписывает заголовок страницы, который отображается в левом меню (по умолчанию `title`)
- `subtitle` (`String`) <badge>v0.5.0+</badge>
  - Добавляет подзаголовок под основным заголовком страницы
- `badge` (`String`) <badge>v0.5.0+</badge>
  - Добавляет бейдж к заголовку страницы

### Пример

```bash[content/ru/index.md]
---
title: 'Введение'
description: 'Прокачай своё NuxtJS приложение с этим потрясающим модулем.'
position: 1
category: 'Начало работы'
version: 1.4
fullscreen: false
menuTitle: 'Введение'
---

Представляю мой потрясающий Nuxt модуль!
```


## Настройки

Вы можете создать файл `content/settings.json`, чтобы настроить тему.

### Параметры

- `title` (`String`)
  - Заголовок вашей документации
- `url` (`String`)
  - Ссылка, где будет развёрнута ваша документация
- `logo` (`String` | `Object`)
  - Логотип вашей документации, может быть `Object` для установки на каждый [цветовой режим](https://github.com/nuxt-community/color-mode-module)
- `github` (`String`)
  - GitHub репозиторий вашего проекта `owner/name` для отображения последней версии, страницы релизов, ссылки наверху страницы и ссылки `Редактировать эту страницу на GitHub` на каждой странице. Пример: `nuxt/content`
  - Для GitHub Enterprise, вы должны предоставить полный url вашего проекта без слэша в конце. Пример: `https://hostname/repos/owner/name`. <badge>v0.6.0+</badge>
- `githubApi` (`String`) <badge>v0.6.0+</badge>
  - Для GitHub Enterprise, в дополнение к `github`, задайте полный url к API вашего проекта без слэша в конце. Например: `https://hostname/api/v3/repos/owner/name`.
  - Релизы считываются из `${githubApi}/releases`.
- `defaultBranch` (`String`) <badge>v0.2.0+</badge>
  - Основная ветка вашего проекта, используется для ссылки `Редактировать эту страницу на GitHub` на каждой странице (по умолчанию `main` если не может быть определена).
- `defaultDir` (`String`) <badge>v0.6.0+</badge>
  - Путь внутри вашего проекта, в котором расположена директория `content`. Используется для ссылки `Редактировать эту страницу на GitHub` на каждой странице (по умолчанию `docs` если ничего не задано, может быть пустой строкой `""` - это необходимо если `content` расположен в корне проекта).
- `layout` (`String`) <badge>v0.4.0+</badge>
  - Шаблон для вашей документации (по умолчанию `default`). Может быть изменено на `single`, чтобы получить одностраничную документацию.
- `algolia` (`Object`) <badge>v0.7.0+</badge>
  - Позволяет использовать [Algolia DocSearch](https://docsearch.algolia.com) для замены простого встроенного поиска. Чтобы включить это, вам нужно предоставить хотя бы `apiKey` и `indexName`:
    ```json
    "algolia": {
        "apiKey": "<API_KEY>",
        "indexName": "<INDEX_NAME>",
        "langAttribute": "language"
    }
    ```
  - Если вы используете `i18n`, убедитесь, что `<langAttribute>` соответствует html lang в файле конфигурации (по умолчанию `language`).
  - Ознакомьтесь с [@nuxt/content](https://github.com/algolia/docsearch-configs/blob/master/configs/nuxtjs_content.json) в качестве примера.
- `twitter` (`String`)
  - Имя пользователя Twitter `@username`, которое вы хотели бы прилинковать. Пример: `@nuxt_js`

### Пример

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

## Компоненты

В теме есть несколько стандартных Vue.js компонентов, которые вы можете использовать в вашем markdown содержимом.

> Вы можете создавать собственные компоненты, помещая их в директорию `components/global/`, ознакомьтесь с [этой секцией](/writing#vue-components). <badge>v0.3.0+</badge>

### `<alert>`

**Входные параметры (Props)**

- `type`
  - Тип: `String`
  - По умолчанию: `'info'`
  - Значения: `['info', 'success', 'warning', 'danger']`

**Пример**

```md
<alert>

Вот, смотрите, алерт с `блоком кода` и [ссылкой](/themes/docs)!

</alert>
```

**Результат**

<alert>

Вот, смотрите, алерт с `блоком кода` и [ссылкой](/themes/docs)!

</alert>

### `<list>`

**Входные параметры (Props)**


- `items`
  - Тип: `Array`
  - По умолчанию: `[]`
- `type` <badge>v0.7.0+</badge>
  - Тип: `String`
  - По умолчанию: `'primary'`
  - Значения: `['primary', 'info', 'success', 'warning', 'danger']`
- `icon` <badge>v0.7.0+</badge>
  - Тип: `String`
  - *Может быть использован для перегрузки дефолтной иконки `type`, ознакомьтесь с [доступными иконками](https://github.com/nuxt/content/tree/dev/packages/theme-docs/src/components/global/icons)*

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

### `<badge>`

<badge>v0.5.0+</badge>

**Пример**

```md
<badge>v1.2+</badge>
```

**Результат**

<badge>v1.2+</badge>

### `<code-group>`

Этот компонент использует `slots`, смотрите `code-block` ниже.

### `<code-block>`

**Входные параметры (Props)**

- `label`
  - Тип: `String`
  - `required`
- `active`
  - Тип: `Boolean`
  - По умолчанию: `false`

**Пример**

```html
# Обратные слэши - для демонстрации

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

## Смотрите также

<showcases :showcases="showcases"></showcases>
