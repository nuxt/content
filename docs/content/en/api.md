---
title: API
description: 'Learn how to use the middleware API.'
position: 8
category: Getting started
---

This module exposes an API in development so you can easily see the JSON of each directory or file, it is available on [http://localhost:3000/_content/](http://localhost:3000/_content/). The prefix is `_content` by default and can be configured with the [apiPrefix](/configuration#apiprefix) property.

Example:

```bash
-| content/
---| articles/
------| hello-world.md
---| index.md
---| settings.json
```

Will expose on `localhost:3000`:
- `/_content/articles`: list the files in `content/articles/`
- `/_content/articles/hello-world`: get `hello-world.md` as JSON
- `/_content/index`: get `index.md` as JSON
- `/_content/settings`: get `settings.json` as JSON
- `/_content`: list `index` and `settings`

The endpoint is accessible on `GET` and `POST` request, so you can use query params: [http://localhost:3000/_content/articles?only=title&only=description&limit=10](http://localhost:3000/_content/articles?only=title&only=description&limit=10).

Since **v1.4.0**, this endpoint also support `where` in query params:

- All the keys that doesn't belong to any of the default ones will be applied to `where`

`http://localhost:3000/_content/articles?author=...`

- You can use `$operators` with `_`:

`http://localhost:3000/_content/articles?author_regex=...`

> This module uses LokiJS under the hood, you can check for [query examples](https://github.com/techfort/LokiJS/wiki/Query-Examples#find-queries).

- You can use [nested properties](/configuration#nestedproperties):

`http://localhost:3000/_content/products?categories.slug_contains=top`

> You can learn more about that endpoint in [lib/middleware.js](https://github.com/nuxt/content/blob/master/lib/middleware.js).
