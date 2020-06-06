---
title: Получение контента
description: 'Изучите как получать ваш статичный контент вместе с $content в вашем Nuxt.js проекте.'
position: 4
category: Начало
---

Этот модуль глобально внедряет экземпляр `$content`, это значит, что вы можете получить доступ к `this.$content` из любого места. В плагинах, asyncData, fetch, nuxtServerInit и Middleware, вы можете получить к нему доступ из `context.$content`.

## Методы

### $content(путь)

- `путь`
  - Тип: `String`
  - По умолчанию: `/`
  - `обязательное`
- Возвращает последовательность цепочек

> Вы можете передать несколько аргументов: `$content('articles', params.slug)` будет преобразовано в `/articles/${params.slug}`

`путь` может быть файлом или директорией. Если это файл, то `fetch()` вернет `Object`, если директория, то вернет `Array`.

Все приведенные ниже методы могут быть объединены в цепочку и возвращать последовательность цепочек, кроме `fetch`, который возвращает `Promise`.

### only(ключи)

- `ключи`
  - Тип: `Array` | `String`
  - `обязательное`

Выберите подмножество полей.

```js
const { title } = await this.$content('article-1').only(['title']).fetch()
```

### where(запрос)

- `запрос`
  - Тип: `Object`
  - `обязательное`

Отфильтровывает результаты по запросу.

Где запросы основаны на подмножестве синтаксиса запросов mongoDB, примеры: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in` и т.д.

```js
// неявно (предполагает оператор $eq)
const articles = await this.$content('articles').where({ title: 'Home' }).fetch()
// явно $eq
const articles = await this.$content('articles').where({ title: { $eq: 'Home' } }).fetch()

// $gt
const articles = await this.$content('articles').where({ age: { $gt: 18 } }).fetch()
// $in
const articles = await this.$content('articles').where({ name: { $in: ['odin', 'thor'] } }).fetch()
```
Для фильтрации в объектах и массивах вам нужно включить nestedProperties, взгляните на [конфигурацию](/configuration#nestedproperties).

```js
const products = await this.$content('products').where({ 'categories.slug': { $contains: 'top' } }).fetch()
const products = await this.$content('products').where({ 'categories.slug': { $contains: ['top', 'woman'] } }).fetch()
```

Этот модуль использует LokiJS под капотом, вы можете взглянуть на [примеры запросов](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

### sortBy(ключ, направление)

- `ключ`
  - Тип: `String`
  - `обязательное`
- `направление`
  - Тип: `String`
  - Значение: `'asc'` или `'desc'`
  - По умолчанию: `'asc'`

Выполняет сортировку значений по ключу.

```js
const articles = await this.$content('articles').sortBy('title').fetch()
```

> Может быть объединен в цепочку для сортировки по нескольким полям.

### limit(кол-во)

- `кол-во`
  - Тип: `String` | `Number`
  - `обязательное`

Ограничивает количество результатов.

```js
// получить только 5 статей
const articles = await this.$content('articles').limit(5).fetch()
```

### skip(кол-во)

- `кол-во`
  - Тип: `String` | `Number`
  - `обязательное`

Пропускает нужное количество результатов.

```js
// получить следующие 5 статей
const articles = await this.$content('articles').skip(5).limit(5).fetch()
```

### search(поле, значение)

- `поле`
  - Тип: `String`
  - `обязательное`
- `значение`
  - Тип: `String`

Выполняет полнотекстовый поиск по полю. `значение` необязательное, в этом случае `поле` является `значением` и поиск будет выполняться по всем определенным полнотекстовым полям поиска.

Поля, по которым вы хотите искать, должны быть определены в опциях, чтобы их можно было проиндексировать, взгляните на [конфигурацию](/configuration#fulltextsearchfields).

```js
// Поиск по полю title
const articles = await this.$content('articles').search('title', 'welcome').fetch()
// Поиск по всем определенным полям
const articles = await this.$content('articles').search('welcome').fetch()
```

### surround(ярлык, настройки)

- `ярлык`
  - Тип: `String`
  - `обязательное`
- `настройки`
  - Тип: `Object`
  - По умолчанию: `{ before: 1, after: 1}`

Получает предыдущий и следующий результаты по конкретному ярлыку.

Вы всегда получите массив фиксированной длины, заполненный документами или `null`.

```js
const [prev, next] = await this.$content('articles')
  .only(['title', 'path'])
  .sortBy('date')
  .where({ isArchived: false })
  .surround('article-2')
  .fetch()

// Возвращает
[
  {
    title: 'Article 1',
    path: 'article-1'
  },
  null // article-3 не существует
]
```

> `search`, `limit` и `skip` неэффективны при использовании этого метода.

### fetch()

- Возвращает: `Promise<Object>` | `Promise<Array>`

Завершает последовательность цепочек и собирает данные.

## Пример

```js
const articles = await this.$content('articles')
  .only(['title', 'date', 'authors'])
  .sortBy('date', 'asc')
  .limit(5)
  .skip(10)
  .where({
    tags: 'testing',
    isArchived: false,
    date: { $gt: new Date(2020) },
    rating: { $gte: 3 }
  })
  .search('welcome')
  .fetch()
```

## API

Этот модуль предоставляет API в разработке, поэтому вы можете легко увидеть JSON каждого каталога или файла, доступные на [http://localhost:3000/_content/](http://localhost:3000/_content/). Префикс `_content` установлен по умолчанию и может быть изменен в параметре  [apiPrefix](/configuration#apiprefix).

Пример:

```bash
-| content/
---| articles/
------| hello-world.md
---| index.md
---| settings.json
```

На `localhost:3000` будет выглядеть так:
- `/_content/articles`: список файлов в `content/articles/`
- `/_content/articles/hello-world`: вернет `hello-world.md` как JSON
- `/_content/index`: вернет `index.md` как JSON
- `/_content/settings`: вернет `settings.json` как JSON
- `/_content`: список `index` и `settings`

Конечная точка доступна для `GET` и `POST` запросов, так что вы можете использовать параметры запроса: [http://localhost:3000/_content/articles?only=title&only=description&limit=10](http://localhost:3000/_content/articles?only=title&only=description&limit=10).

Вы можете узнать больше о конечных точках на [lib/middleware.js](https://github.com/nuxt/content/blob/master/lib/middleware.js).
