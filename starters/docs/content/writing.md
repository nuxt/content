---
title: Writing content
position: 3
category: Getting started
---

First of all, create a `content/` directory in your Nuxt project:

```bash
content/
  articles/
    article-1.md
    article-2.md
  home.md
```

This module will parse files and store them with these properties:

- `dir`
- `path`
- `slug`

## Markdown

> All the data you define in the header will be injected into the document.

A file `content/home.md`:

```md
---
title: Home
---

## Welcome!
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "title": "Home",
  "toc": [
    {
      "id": "welcome",
      "depth": 2,
      "text": "Welcome!"
    }
  ],
  "body": {
    "type": "root",
    "children": [
      {
        "type": "element",
        "tag": "h2",
        "props": {
          "id": "welcome"
        },
        "children": [
          {
            "type": "element",
            "tag": "a",
            "props": {
              "ariaHidden": "true",
              "href": "#welcome",
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
            "value": "Welcome!"
          }
        ]
      }
    ]
  }
}
```

## CSV

> Rows will be assigned to body variable.

A file `content/home.csv`:

```csv
title, description
Home, Welcome!
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "body": [
    {
      "title": "Home",
      "description": "Welcome!"
    }
  ]
}
```

## YAML

> All variables defined will be injected into the document. WARNING: No body will be generated.

A file `content/home.yaml`:

```yaml
title: Home
description: Welcome!
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "title": "Home",
  "description": "Welcome!"
}
```

## JSON / JSON5

> All variables defined will be injected into the document. WARNING: No body will be generated.

A file `content/home.json`:

```json
{
  "title": "Home",
  "description": "Welcome!"
}

```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "title": "Home",
  "description": "Welcome!"
}
```