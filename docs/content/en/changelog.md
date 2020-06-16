---
title: Changelog
description: 'Learn the changes made of the different versions of @nuxt/content module.'
position: 8
category: Getting started
---

## v2.0.0

### Markdown plugins

<base-alert>
  markdown.basePlugins and markdown.plugins have been removed in favor of markdown.remarkPlugins and markdown.rehypePlugins.
</base-alert>

- In development, you can now [live edit](/displaying#live-editing) your content
- Overriding plugins options can still be done but with prefixing by `remark` or `rehype`, for examps `externalLinks` becomes `remarkExternalLinks`.
- You can now override all plugins or append a new plugin using `remarkPlugins` / `rehypePlugins`.
- You can use local plugins using `~/plugins/remark-plugin.js`.
- You can register and configure plugins on the same line like `['remark-plugin', { option: 1 }]`.

Everything is documented in [this section](/configuration#markdown).
