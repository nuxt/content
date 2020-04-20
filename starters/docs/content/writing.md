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

## Markdown

A file `content/home.md`:

```md
----
title: Home
---

## Welcome!
```

Will be transformed into:

```json
{
  "dir": "",
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

## YAML

## JSON

## JSON5