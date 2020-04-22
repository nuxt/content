---
title: Writing content
position: 3
category: Getting started
---

First of all, create a `content/` directory in your project:

```bash
content/
  articles/
    article-1.md
    article-2.md
  home.md
```

This module will parse `.md`, `.yml`, `.csv`, `.json`, `.json5` files and generate the following properties:

- `dir`
- `path`
- `slug`

## Markdown

- Data defined in the header will be injected into the document
- Body is converted to JSON AST
- Table of Contents is generated from headings
- Code blocks are highlighted
- Headings are auto-linked

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

We internally add a `text` key with the markdown body that will be used for [searching](/fetching#searchfield-value) or [extending](http://localhost:3000/advanced#contentfilebeforeinsert) it.

You can see how to display your markdown in your application in the [displaying content](/displaying) section.

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

> Data defined will be injected into the document. WARNING: No body will be generated.

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

> Data defined will be injected into the document. WARNING: No body will be generated.

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
