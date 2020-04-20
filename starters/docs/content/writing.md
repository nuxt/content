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
title: Home page
---

# Home page

> Welcome to my *home page*!
```

Will be transformed into:

```json
{
  "dir": "",
  "slug": "home",
  "path": "/home",
  "updatedAt": "2017-11-07T12:21:34Z",
  "metadata": {
    "title": "Home page"
  },
  "body": {
    "type": "root",
    "children": [
      {
        "type": "heading",
        "depth": 1,
        "children": [
          {
            "type": "text",
            "value": "Home page"
          }
        ]
      },
      {
        "type": "blockquote",
        "children": [
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "value": "Welcome to my ",
              },
              {
                "type": "emphasis",
                "children": [
                  {
                    "type": "text",
                    "value": "home page",
                  }
                ]
              },
              {
                "type": "text",
                "value": "!"
              }
            ]
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