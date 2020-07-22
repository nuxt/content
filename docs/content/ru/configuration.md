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

Прежде чем погрузиться в отдельные атрибуты, взгляните на [Настройки по умолчанию](#defaults).

### Слияние со значениями по умолчанию

Вы можете задать каждый параметр как функцию или статическое значение (примитивы, объекты, массивы и т.д.)
Если вы используете функцию, то стандартное значение будет передано как первый аргумент.

Если вы *не* используете функцию для определения ваших параметров, модуль попытается объединить их со стандартными значениями. Это может быть удобно для `markdown.remarkPlugins`, `markdown.rehypePlugins` и так далее, потому что
значения по умолчанию довольно правильные. Если вы не хотите включать значения по умолчанию, просто используйте функцию.

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

<base-alert type="info">
Следующий пример работает и для `remarkPlugins`, и для `rehypePlugins`
</base-alert>

Чтобы настроить, как модуль будет анализировать Markdown, вы можете:

- Добавить новый плагин к плагинам по умолчанию:

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji']
    }
  }
}
```

- Перезаписать плагины по умолчанию:

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: () => ['remark-emoji']
    }
  }
}
```

- Использовать локальные плагины

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: [
        '~/plugins/my-custom-remark-plugin.js'
      ]
    }
  }
}
```

- Задать параметры в определении плагина

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: [
        ['remark-emoji', { emoticon: true }]
      ]
    }
  }
}
```

- Задать параметры используя имя плагина в `camelCase`

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      // https://github.com/remarkjs/remark-external-links#options
      remarkExternalLinks: {
        target: '_self',
        rel: 'nofollow'
      }
    }
  }
}
```

<base-alert>
При добавлении нового плагина обязательно установите его в ваших зависимостях:
</base-alert>

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add remark-emoji
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install remark-emoji
  ```

  </code-block>
</code-group>

```js{}[nuxt.config.js]
export default {
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji']
    }
  }
}
```

### `markdown.remarkPlugins`

- Тип: `Array`
- По умолчанию: `['remark-squeeze-paragraphs', 'remark-slug', 'remark-autolink-headings', 'remark-external-links', 'remark-footnotes']`
- Версия: **>= v1.4.0**

> Вы можете посмотреть плагины для [remark](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins).

### `markdown.rehypePlugins`

- Тип: `Array`
- По умолчанию: `['rehype-minify-whitespace', 'rehype-sort-attribute-values', 'rehype-sort-attributes', 'rehype-raw']`
- Версия: **>= v1.4.0**

> Вы можете посмотреть плагины для [rehype](https://github.com/rehypejs/rehype/blob/master/doc/plugins.md#list-of-plugins).

### `markdown.basePlugins`

<base-alert>
Устаревшее. Используйте `markdown.remarkPlugins`.
</base-alert>

### `markdown.plugins`

<base-alert>
Устаревшее. Используйте `markdown.remarkPlugins`.
</base-alert>

### `markdown.prism.theme`

- Тип: `String`
- По умолчанию: `'prismjs/themes/prism.css'`

Этот модуль добавляет подсветку синтаксиса кода в markdown используя [PrismJS](https://prismjs.com).

Автоматически ставит тему PrismJS из вашего файла конфигурации Nuxt.js config, поэтому вы можете использовать различные темы, список [тем для prism](https://github.com/PrismJS/prism-themes):

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add prism-themes
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install prism-themes
  ```

  </code-block>
</code-group>

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

### `xml`

- Тип: `Object`
- По умолчанию: `{}`

Этот модуль использует `xml2js` для чтения `.xml` файлов, вы можете посмотреть список настроек [здесь](https://www.npmjs.com/package/xml2js#options).

### `csv`

- Тип: `Object`
- По умолчанию: `{}`

Этот модуль использует `node-csvtojson` для чтения csv файлов, вы можете посмотреть список настроек [здесь](https://github.com/Keyang/node-csvtojson#parameters).

### `extendParser`

- Тип: `Object`
- По умолчанию `{}`

С этим параметром вы можете задать собственные парсеры для различных типов файлов. Также вы можете **перезаписать** стандартный парсер!

Для добавления собственного парсера вам нужно написать функцию, которая принимает как аргумент контент файла и обратно возвращает обработанные данные.

### Пример:

```
const parseTxt = file => file.split('\n').map(line => line.trim())
// В конфигурации:
{
  extendParser: {
    '.txt': parseTxt
  }
}
```

## Настройки по умолчанию

```js{}[nuxt.config.js]
export default {
  content: {
    apiPrefix: '_content',
    dir: 'content',
    fullTextSearchFields: ['title', 'description', 'slug', 'text'],
    nestedProperties: [],
    markdown: {
      remarkPlugins: [
        'remark-squeeze-paragraphs',
        'remark-slug',
        'remark-autolink-headings',
        'remark-external-links',
        'remark-footnotes'
      ],
      rehypePlugins: [
        'rehype-minify-whitespace',
        'rehype-sort-attribute-values',
        'rehype-sort-attributes',
        'rehype-raw'
      ],
      prism: {
        theme: 'prismjs/themes/prism.css'
      }
    },
    yaml: {},
    csv: {},
    xml: {},
    extendParser: {}
  }
}
```
