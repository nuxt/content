---
layout: article
navigation: false
title: 'Announcing Nuxt Content v2'
description: '2 years after the release of Content v1, we are proud to announce the second version of Nuxt Content with the support of Nuxt 3.'
cover: /announcing-v2.png
date: 2022-05-10
authors:
  - name: Sebastien Chopin
    avatarUrl: https://pbs.twimg.com/profile_images/1042510623962275840/1Iw_Mvud_400x400.jpg
    link: https://twitter.com/Atinux
  - name: Yael Guilloux
    avatarUrl: https://pbs.twimg.com/profile_images/1227208659572269056/Yo6GUjZw_400x400.jpg
    link: https://twitter.com/yaeeelglx
  - name: Farnabaz 
    avatarUrl: https://pbs.twimg.com/profile_images/780374165136244736/x5HfdWA1_400x400.jpg
    link: https://twitter.com/a_birang
  - name: Clement Ollivier 
    avatarUrl: https://pbs.twimg.com/profile_images/1370286658432724996/ZMSDzzIi_400x400.jpg
    link: https://twitter.com/clemcodes
tags:
  - Nuxt
  - Content
  - Release
category: Announcements
---

2 years after the [release of Content v1](https://github.com/nuxt/content/releases/tag/v1.0.0), we are proud to announce the second version of Nuxt Content with the support of [Nuxt 3](https://v3.nuxtjs.org).

It has been rewritten in TypScript and comes with new features:

::list{icon="heroicons-outline:badge-check"}
- The [MDC Syntax](/guide/writing/mdc) for Components in Markdown
- [Multi sources](/api/configuration#sources) (experimental)
- Locale support (i18n)
- [Navigation generation](/guide/displaying/navigation)
- Live preview edition (coming soon)
::

The repository is open source under the MIT license and available on GitHub: [nuxt/content](https://github.com/nuxt/content)

## What is Nuxt Content?

Nuxt Content is a [Nuxt module](https://v3.nuxtjs.org/guide/features/modules) allowing you to have a `content/` directory where you can place your Markdown, YAML, CSV and JSON files.

Let’s imagine a content directory with the following structure:

::code-group
  ```[Directory Structure]
  content/
    hello.md
  ```
  ```md [hello.md]
  # Hello World

  My first paragraph.

  https://content.nuxtjs.org
  ```
::

You can query the `hello.md` document by using the `queryContent()` composable:

```ts
const document = await queryContent('hello').findOne()
```

::alert
  ::details
    :summary[The returned document won't be Markdown or HTML, but a JSON representing the abtract syntax tree.]
    ```json [document value]
    {
      "type": "markdown",
      "id": "content:hello.md",
      "source": "content",
      "path": "hello",
      "extension": "md",
      "atime": "2022-05-10T14:38:23.462Z",
      "mtime": "2022-05-10T14:38:23.462Z",
      "size": 63,
      "slug": "/hello",
      "draft": false,
      "partial": false,
      "empty": false,
      "title": "Hello World",
      "description": "My first paragraph.",
      "body": {
        "type": "root",
        "children": [
          {
            "type": "element",
            "tag": "h1",
            "props": {
              "id": "hello-world"
            },
            "children": [
              {
                "type": "text",
                "value": "Hello World"
              }
            ]
          },
          {
            "type": "element",
            "tag": "p",
            "props": {},
            "children": [
              {
                "type": "text",
                "value": "My first paragraph."
              }
            ]
          },
          {
            "type": "element",
            "tag": "p",
            "props": {},
            "children": [
              {
                "type": "element",
                "tag": "a",
                "props": {
                  "href": "https://content.nuxtjs.org",
                  "rel": [
                    "nofollow",
                    "noopener",
                    "noreferrer"
                  ],
                  "target": "_blank"
                },
                "children": [
                  {
                    "type": "text",
                    "value": "https://content.nuxtjs.org"
                  }
                ]
              }
            ]
          }
        ],
        "toc": {
          "title": "",
          "searchDepth": 2,
          "depth": 2,
          "links": []
        }
      }
    }
    ```
  ::
::

This document can be displayed using the [`<Content>`](/guide/displaying/rendering) component:

```html
<Content :document="document" />
```

This will render:

::code-group
  ::code-block{label="Preview"}
    # Hello World

    My first paragraph.

    https://content.nuxtjs.org
  ::
::

Best is to view it in video:

::video-player{loop playsinline controls}
---
sources:
- src: https://res.cloudinary.com/nuxt/video/upload/q_auto/v1652198986/hello-content-world_d7byjh.webm
  type: video/webm
- src: https://res.cloudinary.com/nuxt/video/upload/q_auto/v1652198986/hello-content-world_d7byjh.mp4
  type: video/mp4
- src: https//res.cloudinary.com/nuxt/video/upload/q_auto/v1652198986/hello-content-world_d7byjh.ogv
  type: video/ogg
poster: https://res.cloudinary.com/nuxt/video/upload/v1652198986/hello-content-world_d7byjh.jpg
---
::

You can do much more than fetching only one document, take a look at the [querying content](/guide/displaying/querying) section to discover the full potential.


## Introducing MDC

In Content v1, you were able to use Vue components directly into the Markdown using the HTML syntax but this had limitations:

::list{icon="heroicons-outline:emoji-sad"}
- Only kebab case naming
- No `<self-closing/>` tags
- Extra blank lines around the HTML tags for having Markdown in slots
- No named slots
- Props had to live in document front-matter = no scope
- No inline components combined with Markdown
::

To solve all the issues above, we created a new Markdown syntax for leveraging the power of Vue components: [The MarkDown Components syntax](/guide/writing/mdc).

::alert
MDC is Markdown, so nothing changes and you can keep using the `.md` extension.
::

You can replace all your HTML tags with a colon naming convention:

::code-group
  ```html [Content v1]
  <my-button>hello</my-button>
  ```
  ```md [Content v2]
  :my-button[hello]

  or

  ::my-button
  hello
  ::
  ```
::

Head over to the [MDC guide](/guide/writing/mdc) to discover the full power of Markdown with Vue components.

## Thank you

We are thanksful from all the contributions we received in Content v1 and are impatient to see what you will build with Nuxt 3 and Content v2 :blush:
