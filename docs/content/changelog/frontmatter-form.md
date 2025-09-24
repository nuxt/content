---
name: Visual front-matter edition
title: Visual Front-matter Edition
description: Your page metadata is now editable through a visual interface instead of YAML.
date: 2024-10-17T00:00:00.000Z
image:
  src: /blog/frontmatters.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
category: studio
---

::warning
This article was published before the merge of the [Content](https://github.com/nuxt/content) and [Studio](https://github.com/nuxtlabs/studio-module) modules on January 6, 2025. As a result, it may contain some inconsistencies. The Studio module is now deprecated and available as an opt-in feature of the Content module. Learn how to enable it in [this guide](/docs/getting-started).
::

## Visual Front-Matter editing

You can now edit your markdown front-matter without writing in the `YAML` syntax. Instead, Nuxt Studio automatically generates a user-friendly form that simplifies metadata editing.

:video{autoplay controls loop poster="https://res.cloudinary.com/nuxt/video/upload/v1729157955/frontmatterform2_rmh58v.jpg" src="https://res.cloudinary.com/nuxt/video/upload/v1729157955/frontmatterform2_rmh58v.mp4"}

## What is the front-matter?

Front-matter is a convention used in Markdown-based CMSs to provide metadata for pages, such as descriptions, titles, and more. In [Nuxt Content](/docs/files/markdown#front-matter), the front-matter uses the YAML syntax.

::callout{icon="i-ph-info" to="/docs/files/markdown#front-matter"}
For more detailed information about front-matter syntax, visit the Nuxt Content documentation.
::

## The last piece of our non-technical editor

Nuxt Studio has been designed with non-technical users in mind, mainly since our editor has been released. Our goal is to make markdown and content edition accessible to everyone.

The automatic form generation for front-matter is the next logical step. By moving away from the complexities of YAML syntax, we’re simplifying the process for non-developers, offering dynamic input options like image pickers, date pickers, boolean toggles and more. This enhancement brings us to a fully visual, user-friendly content management experience.

## Expanding to all YAML and JSON files

Soon, the form generation feature will extend to all `YAML` and `JSON` files you edit within Nuxt Studio, making it easier than ever to work with structured data.

## Looking ahead to Nuxt Content v3

::callout{icon="i-ph-lightbulb"}
This section is just a teaser of [Nuxt Content v3](https://github.com/nuxt/content/tree/v3). We will publish a more detailed blog post soon.
::

We're actively working on the next major update of Nuxt Content which will bring significant performance improvements and new features to further enhance your content management experience.

### Improved Performance

A key challenge with Nuxt Content v2 was the large bundle size required to store all content files. It was an issue when deploying to edge platforms like [NuxtHub](https://hub.nuxt.com/).

To address this, Nuxt Content v3 moves away from the file based storing in production and leverage SQL database system. This switch is transparent to users. We're providing a zero config support for development mode, static generation, server rendering and edge deployments with NuxtHub.

### Introducing Collections

Collections are groups of related content items within your Nuxt Content project. They help organize and manage large datasets more efficiently.

#### Define collections

You'll be able to define collections in the `content.config.ts` file which is used by Nuxt Content to configure database structures, utility types, and methods for finding, parsing, and querying content.

#### Collections schema

Schemas enforce consistency within collections and improve TypeScript typings for better integration with Nuxt Content utilities.

```ts [content.config.ts]
import { defineCollection, z } from '@nuxt/content'

// Export collections
export const collections = {
  // Define collection using `defineCollection` utility
  posts: defineCollection({
    // Specify the type of content in this collection
    type: 'page',
    // Load every file matching this pattern
    source: 'blog/**/*.md',
    // Define custom schema for this collection
    schema: z.object({
      date: z.date(),
      image: z.object({
        src: z.string(),
        alt: z.string()
      }),
      badge: z.object({
        label: z.string(),
        color: z.string()
      })
    })
  }),
}
```

### Built with Nuxt Studio in mind

Nuxt Studio was originally developed alongside Nuxt Content v2, but with v3, we're building the module with Nuxt Studio experience in mind. Our goal is to create the best CMS platform for content editing, while still offering the best developers experience.

For example, collection schemas will help us further enhance form generation in Studio. Among other things, you'll be able to set the editor type for a field directly in your schema.

```ts [content.config.ts]
image: z.object({
    src: z.string().editor({ type: 'media' })
    alt: z.string()
}),
icon: z.string().editor({ type: 'icon' })
```

::callout{icon="i-ph-lightbulb" to="https://github.com/nuxt/content/tree/main"}
Nuxt Content v3 has been officially released. Don't hesitate to try it out and give us feedback.
::
