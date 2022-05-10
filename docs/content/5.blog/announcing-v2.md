---
layout: article
navigation: false
title: 'Going Full Static'
description: 'Long awaited features for JAMstack fans has been shipped in v2.13: full static export, improved smart prefetching, integrated crawler, faster re-deploy, built-in web server and new target option for config ⚡️'
imgUrl: blog/going-full-static/main.jpeg
imgCredits: Vincent Ledvina
imgCreditsUrl: https://unsplash.com/@vincentledvina
date: 2020-06-18
authors:
  - name: Sebastien Chopin
    avatarUrl: https://pbs.twimg.com/profile_images/1042510623962275840/1Iw_Mvud_400x400.jpg
    link: https://twitter.com/Atinux
tags:
  - Nuxt
  - Static
  - Crawler
  - Live Preview
category: Announcements
---

# Announcing Nuxt Content v2

2 years after the [release of Content v1](https://github.com/nuxt/content/releases/tag/v1.0.0), we are proud to announce the second version of Nuxt Content with the support of [Nuxt 3](https://v3.nuxtjs.org).

It has been rewritten in TypScript and comes with new features:

- **MDC:** Markdown Components
- Multi sources (experimental)
- Locale support (i18n)
- Navigation generation
- Live preview edition (coming soon)

The repository is open source under the MIT license and available on GitHub: [nuxt/content](https://github.com/nuxt/content)
## What is Nuxt Content?

Nuxt Content is a [Nuxt module](https://modules.nuxtjs.org) allowing you to have a `content/` directory where you can place your Markdown, YAML, CSV and JSON files.

Let’s imagine a content directory with the following structure:


|content/<br>`  `posts/<br>`    `hello-world.md<br>`    `second-post.md|
| :- |

You can start querying your documents with a MongoDB-like syntax in your Vue components:


|const document = await queryContent('posts').where({ }).findOne()|
| :- |

Read more about [querying with Nuxt Content 2](https://content-v2.nuxtjs.org/api/query-content).

TODO: demo & video same as https://content.nuxtjs.org/#videos
## Introducing MDC

In Content 1, you were able to use Vue components directly into the Markdown using the HTML syntax but this had limitations:

- Only kebab case naming
- No self-closing tags
- Extra blank lines around the HTML tags for having Markdown in slots
- No named slots were possible
- Props had to live in document front-matter = no scope
- No inline components were possible combined with Markdown

In Content 2, we created a new Markdown syntax for leveraging the power of Vue components and fixing all the issues above, introducing the MDC syntax.

First, MDC is Markdown, so nothing changes and you can keep using the .md extension.

Next, the HTML tags are replaced with a colon-like naming convention:

<my-component /> becomes :my-component (or now possible :MyComponent)

If you need to use slots, you can the the :: syntax:

<my-button>hello</my-button> becomes :my-button[hello]

Yes, you can use Markdown inside it:

## How does it work?
