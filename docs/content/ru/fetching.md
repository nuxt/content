---
title: Получение контента
description: 'Изучите как получать ваш статичный контент вместе с $content в вашем Nuxt.js проекте.'
position: 4
category: Начало
---

Этот модуль глобально внедряет экземпляр `$content`, это значит, что вы можете получить доступ к `this.$content` из любого места. В плагинах, asyncData, fetch, nuxtServerInit и Middleware, вы можете получить к нему доступ из `context.$content`.

## Методы

### $content(путь, параметры?)

- `путь`
  - Тип: `String`
  - По умолчанию: `/`
- `параметры`
  - Тип: `Object`
  - По умолчанию: `{}`
  - Версия: **v1.3.0**
- `параметры.deep`
  - Тип: `Boolean`
  - По умолчанию: `false`
  - Версия: **v1.3.0**
  - *Получение файлов из поддиректорий*
- `параметры.text`
  - Тип: `Boolean`
  - По умолчанию: `false`
  - Версия: **v2.0.0**
  - *Возвращает оригинальное содержание markdown в переменной `text`*
- Возвращает последовательность цепочек

> Вы можете передать несколько аргументов: `$content('articles', params.slug)` будет преобразовано в `/articles/${params.slug}`

`путь` может быть файлом или директорией. Если `путь` это файл, то `fetch()` вернет `Object`, если директория, то вернет `Array`.

Все приведенные ниже методы могут быть объединены в цепочку и возвращать последовательность цепочек, кроме `fetch`, который возвращает `Promise`.

### only(ключи)

- `ключи`
  - Тип: `Array` | `String`
  - `обязательное`

Выберите подмножество полей.

```js
const { title } = await this.$content('article-1').only(['title']).fetch()
```

### without(ключи)

- `keys`
  - Тип: `Array` | `String`
  - `обязательное`

Исключите подмножество полей.

```js
const { title, ...propsWithoutBody } = await this.$content('article-1').without(['body']).fetch()
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

> Этот модуль использует LokiJS под капотом, вы можете взглянуть на [примеры запросов](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

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

<alert type="info">

Посмотрите [пример](/snippets#search) о том, как реализовать поиск в вашем приложении

</alert>


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

<alert type="info">

Посмотрите [пример](/snippets#pagination) как реализовать ссылки вперед и назад в вашем приложении

</alert>

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

> Вы можете проверить, как использовать [API контента](/advanced#api-endpoint) в разработке.
