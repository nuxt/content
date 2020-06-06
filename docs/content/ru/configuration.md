---
title: Настройка
description: 'Вы можете настроить @nuxt/content через свойство content в вашем nuxt.config.js.'
category: Начало
position: 6
---

Вы можете настроить `@nuxt/content` через свойство `content` в вашем `nuxt.config.js`.

```js{}[nuxt.config.js]
export default {
  content: {
    // Мои настройки
  }
}
```

Смотрите [Настройки по умолчанию](#defaults).

## Параметры

### `apiPrefix`

- Тип: `String`
- По умолчанию: `'/_content'`

Маршрут, использующийся для клиентских API вызовов и SSE(Server-Sent Events — «события, посылаемые сервером»).

```js{}[nuxt.config.js]
content: {
  // $content api будет доступен на localhost:3000/content-api
  apiPrefix: 'content-api'
}
```

### `dir`

- Тип: `String`
- По умолчанию: `'content'`

Директория, используемая для написания контента.
Вы можете указать абсолютный или относительный путь, будет обработано Nuxt [srcDir](https://nuxtjs.org/api/configuration-srcdir).

```js{}[nuxt.config.js]
content: {
  dir: 'my-content' // читать контент из my-content/
}
```

### `fullTextSearchFields`

- Тип: `Array`
- По умолчанию: `['title', 'description', 'slug', 'text']`

Поля, которые нужно проиндексировать, для возможности поиска по ним, почитайте подробнее об этом [здесь](/fetching#searchfield-value).

`text` специальный ключ, включающий ваш Markdown перед преобразованием в AST.

```js{}[nuxt.config.js]
content: {
  // Искать только по title и description
  fullTextSearchFields: ['title', 'description']
}
```
### `nestedProperties`

- Тип `Array`
- По умолчанию: `[]`
- Версия: **v2.0.0**

Зарегистрируйте вложенные свойства для обработки обращения через точку и глубокой фильтрации.

```js{}[nuxt.config.js]
content: {
  nestedProperties: ['categories.slug']
}
```

### `markdown`

Этот модуль использует [remark](https://github.com/remarkjs/remark) «под капотом» для компиляции markdown файлов в JSON AST, который будет храниться в переменной `body`.

По умолчанию этот модуль использует плагины для улучшения чтения markdown. Вы можете добавить собственные в `plugins` или переопределить плагины по умолчанию с помощью `basePlugins`. Каждый плагин настраивается с использованием его имени в camelCase: `remark-external-links` => `externalLinks`.

> Вы можете посмотреть плагины для remark [здесь](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins)

### `markdown.basePlugins`

- Тип: `Array`
- По умолчанию: `['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes']`

### `markdown.plugins`

- Тип: `Array`
- По умолчанию: `[]`

### `markdown.externalLinks`

- Тип: `Object`
- По умолчанию: `{}`

Вы можете контролировать поведение ссылок с помощью этой опции. Вы можете посмотреть список настроек [здесь](https://github.com/remarkjs/remark-external-links#api).

```js{}[nuxt.config.js]
content: {
  markdown: {
    externalLinks: {
      target: '_self' // отключить target="_blank"
      rel: false // отключить rel="nofollow noopener"
    }
  }
}
```

### `markdown.footnotes`

- Тип: `Object`
- По умолчанию: `{ inlineNotes: true }`

Вы можете контролировать поведение сносок с помощью этой опции. Вы можете посмотреть список настроек [здесь](https://github.com/remarkjs/remark-footnotes#remarkusefootnotes-options).

### `markdown.prism.theme`

- Тип: `String`
- По умолчанию: `'prismjs/themes/prism.css'`

Этот модуль добавляет подсветку синтаксиса кода в markdown используя [PrismJS](https://prismjs.com).

Автоматически ставит тему PrismJS из вашего файла конфигурации Nuxt.js config, поэтому вы можете использовать различные темы, список [тем для prism](https://github.com/PrismJS/prism-themes):

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-material-oceanic.css'
    }
  }
}
```

Для отключения темы по умолчанию установите prism значение `false`:

```js{}[nuxt.config.js]
content: {
  markdown: {
    prism: {
      theme: false
    }
  }
}
```

### `yaml`

- Тип: `Object`
- По умолчанию: `{}`

Этот модуль использует `js-yaml` для чтения yaml файлов, вы можете посмотреть список настроек [здесь](https://github.com/nodeca/js-yaml#api).

Обратите внимание, что мы выставляем параметр `json: true`.

### `csv`

- Тип: `Object`
- По умолчанию: `{}`

Этот модуль использует `node-csvtojson` для чтения csv файлов, вы можете посмотреть список настроек [здесь](https://github.com/Keyang/node-csvtojson#parameters).

## Настройки по умолчанию

```js{}[nuxt.config.js]
export default {
  content: {
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug', 'text'],
    nestedProperties: [],
    markdown: {
      externalLinks: {},
      footnotes: {
        inlineNotes: true
      },
      basePlugins: ['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes'],
      plugins: [],
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {}
  }
}
```
