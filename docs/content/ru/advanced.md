---
title: Продвинутое использование
description: 'Изучите продвинутое использование модуля @nuxt/content.'
position: 7
category: Начало
---

## Программное использование

`$content` доступен из **@nuxt/content**.

<base-alert>

  Обратите внимание, что вы можете получить к нему доступ только **после того, как модуль будет загружен** Nuxt'ом. `require('@nuxt/content')` должно произойти в хуках или внутренних методах Nuxt.

</base-alert>

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async ready () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['slug']).fetch()
      console.log(files)
    }
  }
}
```

### Статическая генерация сайта

<base-alert type="info">

Если вы используете Nuxt 2.13+, `nuxt export` имеет встроенную функцию сканирования, поэтому вам не нужно использовать `generate.routes`.

</base-alert>

При использовании `nuxt generate`, вам нужно указать динамические маршруты в [`generate.routes`](https://nuxtjs.org/api/configuration-generate/#routes), потому что Nuxt не знает какие маршруты нужно генерировать.

**Пример**

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  generate: {
    async routes () {
      const { $content } = require('@nuxt/content')
      const files = await $content().only(['path']).fetch()

      return files.map(file => file.path === '/index' ? '/' : file.path)
    }
  }
}
```

## Хуки

Этот модуль добавляет несколько хуков, которые вы можете использовать:

### `content:file:beforeInsert`

Позволяет добавить данные в документ прежде, чем он будет сохранен.

Аргументы:
- `document`
  - Тип: `Object`
  - Свойства:
    - Смотрите [написание контента](/writing)


**Пример**

Возьмем к примеру блог, мы используем `file:beforeInsert` чтобы добавить `readingTime` в документ, используя [reading-time](https://github.com/ngryman/reading-time).

> `text` это контент markdown файла перед тем, как он будет преобразован в JSON AST, вы можете использовать его на этом этапе, но он не возвращается API.

```js
export default {
  modules: [,
    '@nuxt/content'
  ],
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        const { time } = require('reading-time')(document.text)

        document.readingTime = time
      }
    }
  }
}
```

## Обработка горячей перезагрузки

<base-alert type="info">

В режиме разработке модуль автоматически вызывает действие стора(Vuex) `nuxtServerInit`(если задано) и `$nuxt.refresh()` для перезагрузки текущей страницы.

</base-alert>

В случае, если вам нужно слушать событие, чтобы выполнить что-то еще, вам нужно слушать событие `content:update` на стороне клиента, используя `$nuxt.$on('content:update')`:

```js{}[plugins/update.client.js
export default function ({ store }) {
  // Только в режиме разработки
  if (process.dev) {
    window.onNuxtReady(($nuxt) => {
      $nuxt.$on('content:update', ({ event, path }) => {
        // Обновить категории в сторе
        store.dispatch('fetchCategories')
      })
    })
  }
}
```

Затем добавьте ваш плагин в `nuxt.config.js`:

```js{}[nuxt.config.js]
export default {
  plugins: [
    '@/plugins/update.client.js'
  ]
}
```

Теперь, каждый раз, когда вы будете обновлять файл в вашей директории `content/`, будет выполняться метод `fetchCategories`.
Эта документация использует его и вы можете узнать больше, взглянув на[plugins/categories.js](https://github.com/nuxt/content/blob/master/docs/plugins/categories.js).
