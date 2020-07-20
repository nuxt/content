---
title: Написание контента
description: 'Научитесь писать в директории content/, поддерживаются Markdown, YAML, CSV и JSON.'
position: 3
category: Начало
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

Для начала, создайте директорию `content/` в вашем проекте:

```bash
content/
  articles/
    article-1.md
    article-2.md
  home.md
```

Этот модуль будет обрабатывать файлы  `.md`, `.yaml`, `.csv`, `.json`, `.json5` и генерировать следующие свойства:

- `dir`
- `path`
- `slug`
- `extension` (например: `.md`)
- `createdAt`
- `updatedAt`

## Markdown

Этот модуль конвертирует ваши `.md` файлы в древовидную JSON AST структуру, которая будет храниться в переменной `body`.

Обязательно используйте компонент `<nuxt-content>` для отображения контента из вашего markdown, взгляните на [отображение контента](/displaying).

> Вы можете взглянуть на [руководство по базовому синтаксису](https://www.markdownguide.org/basic-syntax), чтобы лучше разобраться в Markdown

### Содержание

Вы можете добавить содержание в ваш markdown файл. Содержание должно быть первым в файле и иметь форму действительного YAML, установленного между тройными пунктирными линиями. Вот основной пример:

```md
---
title: Вступление
description: Изучите как использовать @nuxt/content.
---
```

Эти переменные будут вставлены в документ:

```json
{
  body: Object
  title: "Вступление"
  description: "Изучите как использовать @nuxt/content."
  dir: "/"
  extension: ".md"
  path: "/index"
  slug: "index"
  toc: Array
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Заголовки

Этот модуль автоматически добавит `id` и `link` к каждому заголовку.

Представим, что у нас есть такой файл:

```md[home.md]
# Lorem ipsum
## dolor—sit—amet
### consectetur &amp; adipisicing
#### elit
##### elit
```

Это будет преобразовано в древовидную JSON AST структуру и использовано компонентом `nuxt-content` и в итоге получится вот такой HTML:

```html
<h1 id="lorem-ipsum-"><a href="#lorem-ipsum-" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>Lorem ipsum</h1>
<h2 id="dolorsitamet"><a href="#dolorsitamet" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>dolor—sit—amet</h2>
<h3 id="consectetur--adipisicing"><a href="#consectetur--adipisicing" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>consectetur &#x26; adipisicing</h3>
<h4 id="elit"><a href="#elit" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h4>
<h5 id="elit-1"><a href="#elit-1" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h5>
```

> Ссылки в заголовках пусты и поэтому скрыты, но вы можете стилизовать их. Взгляните на документацию, которая появляется при наведении на заголовок.

### Ссылки

Ссылки преобразуются для добавления корректных `target` и `rel` атрибутов используя [remark-external-links](https://github.com/remarkjs/remark-external-links). Взгляните [сюда](/configuration#markdown) чтобы изучить как настроить это плагин.

Относительные ссылки будут также преобразованы в `nuxt-link`, чтобы обеспечить навигацию между компонентами страниц и улучшит производительность используя умную предзагрузку.

Пример использования внешней, относительной, markdown и html ссылок:

```md
---
title: Главная
---

## Ссылки

<nuxt-link to="/articles">Nuxt ссылка на блог</nuxt-link>

<a href="/articles">Html ссылка на блог</a>

[Markdown ссылка на блог](/articles)

<a href="https://nuxtjs.org">Внешняя html ссылка</a>

[Внешняя markdown ссылка](https://nuxtjs.org)
```

### Сноски

Этот модуль поддерживает расширенный markdown синтаксис для сносок используя [remark-footnotes](https://github.com/remarkjs/remark-footnotes). Взгляните [сюда](/configuration#markdown) чтобы изучить как настроить это плагин.

Пример использования сносок:

```md
Это простая сноска,[^1], а это более длинная сноска.[^bignote]

[^1]: Это первая сноска.

[^bignote]: Это сноска с несколькими абзацами и кодом.

    Добавим абзацы, чтобы включить их в сноску.

    `{ мой код }`

    Добавьте столько абзацев, сколько вам нужно.
```

> Вы можете почитать [руководство по расширенному синтаксису](https://www.markdownguide.org/extended-syntax/#footnotes) о сносках

### Блоки кода

Этот блок автоматически обернет ваши блоки кода и применит [PrismJS](https://prismjs.com) классы (посмотрите [синтаксис выделений](/writing#syntax-highlighting)).

Блоки кода в Markdown оборачиваются 3-мя обратными кавычками. Также, вы можете задать язык блока кода, чтобы включить подсветку синтаксиса.

По умолчанию Markdown не поддерживает подсветку строк внутри блока кода и имен файлов. Однако этот модуль позволяет использовать собственный синтаксис:

- Номера строк внутри фигурных скобок
- Имя файла в квадратных скобках

<pre class="language-js">
```js{1,3-5}[server.js]
const http = require('http')
const bodyParser = require('body-parser')

http.createServer((req, res) => {
  bodyParser.parse(req, (error, body) => {
    res.end(body)
  })
}).listen(3000)
```
</pre>

После отрисовки компонента `nuxt-content` это будет выглядеть так:

```html
<div class="nuxt-content-highlight">
  <span class="filename">server.js</span>
  <pre class="language-js" data-line="1,3-5">
    <code>
      ...
    </code>
  </pre>
</div>
```

> Номера строк добавляются к тегу `pre` в атрибуте `data-line`.

> Имя файла будет преобразовано в span с классом `filename`, это позволит стилизовать их. Взгляните на документацию в правом верхнем углу блоков кода.

### Подсветка синтаксиса

По умолчанию, подсветка кода обеспечивается использованием [PrismJS](https://prismjs.com) и темой, указанной в опциях вашего Nuxt.js приложения, взгляните на [конфигурацию](/configuration#markdownprismtheme).

### HTML

Вы можете писать HTML внутри вашего Markdown:

```md[home.md]
---
title: Главная
---

## HTML

<p><span class="note">Смесь <em>Markdown</em> и <em>HTML</em>.</span></p>
```

Помните, что при размещении Markdown внутри компонента перед ним должна стоять пустая строка, иначе весь блок обрабатывается как пользовательский HTML.

**Это не будет работать:**

```html
<div class="note">
  *Markdown* и <em>HTML</em>.
</div>
```

**Но это будет:**

```html
<div class="note">

  *Markdown* и <em>HTML</em>.

</div>
```

Также как **это**:

```html
<span class="note">*Markdown* и <em>HTML</em>.</span>
```

### Vue компоненты

Вы можете использовать глобальные Vue компоненты или импортированные локально, на страницу, где отображается ваш markdown.

Поскольку `@nuxt/content` предполагает, что весь Markdown предоставлен автором (а не с помощью сторонних пользователей), исходные тексты обрабатываются полностью (включая теги), с помощью [rehype-raw](https://github.com/rehypejs/rehype-raw):

1. Вы должны использовать ваши компоненты в kebab case:

```html
Используйте <my-component> вместо <MyComponent>
```

2. Вы не можете использовать самозакрывающиеся теги, потому что **это не будет работать**:

```html
<my-component/>
```

А **это будет**:

```html
<my-component></my-component>
```

**Примеры:**

Мы определили компонент [ExampleMultiselect.vue](https://github.com/nuxt/content/blob/master/docs/components/examples/ExampleMultiselect.vue):

```md[home.md]
Выберите *фреймворк*:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>
```

**Результат:**

<div class="border rounded p-2 mb-2 bg-gray-200 dark:bg-gray-800">
Выберите <i>фреймворк</i>:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>

</div>

Также вы можете задать параметры:

```md[home.md]
---
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

<example-multiselect :options="multiselectOptions"></example-multiselect>
```

<example-multiselect :options="multiselectOptions"></example-multiselect><br>

<base-alert type="info">

Эти компоненты будут отрисованы используя компонент `<nuxt-content>`, взгляните на [отображение контента](/displaying#component).

</base-alert>

#### Шаблоны

Вы можете использовать теги `template` для отрисовки контента внутри вашего Vue.js компонента:

```html
<my-component>
  <template #named-slot>
    <p>Контент именованного слота.</p>
  </template>
</my-component>
```

Однако, вы не можете использовать
[динамический контент](https://vuejs.org/v2/guide/syntax.html), не используйте
[входные параметры слота](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots). например,
**это не будет работать**:

```html
<my-component>
  <template #named-slot="slotProps">
    <p>{{ slotProps.someProperty }}</p>
  </template>
</my-component>
```

#### Глобальные компоненты

Начиная с **v2.0.0** и Nuxt **v2.13.0**, вы можете положить ваши компоненты в директорию `components/global/` и вам не прийдется импортировать их на свои страницы.

```bash
components/
  global/
    Hello.vue
content/
  home.md
```

Затем в `content/home.md`, вы можете добавить компонент `<hello></hello>` не беспокоясь о его импорте на страницу.

### Оглавление

Массив `toc` будет выведен в ваш документ, в нем будут перечислены все `h2` и `h3` с их заголовками и идентификаторами, чтобы вы смогли связать их.

```json
{
  "toc": [{
    "id": "welcome",
    "depth": 2,
    "text": "Welcome!"
  }]
}
```

> Взгляните на правую часть этой страницы для примера.

<base-alert type="info">

Взгляните на [этот пример](/examples#table-of-contents) о том, как внедрить оглавление в ваше приложение

</base-alert>

### Пример

Файл `content/home.md`:

```md
---
title: Главная
---

## Добро пожаловать!
```

Будет преобразовано в:

```json
{
  "dir": "/",
  "slug": "главная",
  "path": "/главная",
  "extension": ".md",
  "title": "Главная",
  "toc": [
    {
      "id": "добро-пожаловать",
      "depth": 2,
      "text": "Добро пожаловать!"
    }
  ],
  "body": {
    "type": "root",
    "children": [
      {
        "type": "element",
        "tag": "h2",
        "props": {
          "id": "добро-пожаловать"
        },
        "children": [
          {
            "type": "element",
            "tag": "a",
            "props": {
              "ariaHidden": "true",
              "href": "#добро-пожаловать",
              "tabIndex": -1
            },
            "children": [
              {
                "type": "element",
                "tag": "span",
                "props": {
                  "className": [
                    "icon",
                    "icon-link"
                  ]
                },
                "children": []
              }
            ]
          },
          {
            "type": "text",
            "value": "Добро пожаловать!"
          }
        ]
      }
    ]
  }
}
```

Мы добавляем ключ `text` с телом markdown, чтобы использовать это для [поиска](/fetching#searchfield-value) или для [расширения](http://localhost:3000/advanced#contentfilebeforeinsert).

## CSV

Строки будут присвоены к переменной body.

### Пример

Файл `content/home.csv`:

```csv
title, description
Главная, Добро пожаловать!
```

Будет преобразовано в:

```json
{
  "dir": "/",
  "slug": "главная",
  "path": "/главная",
  "extension": ".json",
  "body": [
    {
      "title": "Главная",
      "description": "Добро пожаловать!"
    }
  ]
}
```

## XML

Будет преобразовано в:

### Пример

Файл `content/home.xml`:

```xml
<xml>
  <item prop="abc">
    <title>Заголовок</title>
    <description>Привет мир</description>
  </item>
</xml>
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".xml",
  "body": {
    "xml": {
      "item": [
        {
          "$": {
            "prop": "abc"
          },
          "title": [
            "Заголовок"
          ],
          "description": [
            "ривет мир"
          ]
      }
    ]
  }
}
```


## YAML / YML

Указанные данные будут выведены в документ.

> Переменная body не будет сгенерирована.

### Пример

Файл `content/home.yaml`:

```yaml
title: Главная
description: Добро пожаловать!
```

Будет преобразовано в:

```json
{
  "dir": "/",
  "slug": "главная",
  "path": "/главная",
  "extension": ".yaml",
  "title": "Главная",
  "description": "Добро пожаловать!"
}
```

## JSON / JSON5

Указанные данные будут выведены в документ.

> Переменная body не будет сгенерирована.

### Пример

Файл `content/home.json`:

```json
{
  "title": "Главная",
  "description": "Добро пожаловать!"
}

```

Будет преобразовано в:

```json
{
  "dir": "/",
  "slug": "главная",
  "path": "/главная",
  "extension": ".json",
  "title": "Главная",
  "description": "Добро пожаловать!"
}
```
