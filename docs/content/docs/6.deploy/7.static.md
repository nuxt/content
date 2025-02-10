---
title: Static Hosting
description: How to deploy Nuxt Content to static hosting with static site generation.
navigation:
  title: Static
---

## What is Static Hosting?

Static hosting is a type of hosting where your website is built and served as static files (HTML, CSS, JS) that can be served by any static file server.

Nuxt Content can be deployed to static hosting using Nuxt prerendering.

## Building with SSG

To build your app with static site generation, run the following command:

```bash
npx nuxi generate
```

::tip{icon="i-lucide-check"}
This command will create a `dist/` directory with your static site. You can upload it to any static hosting service.
::

Nuxt will automatically pre-render all pages using an internal crawler, you can customize it's behavior with the `nitro.prerender` options.

::note{to="https://nuxt.com/docs/getting-started/prerendering"}
Learn more about pre-rendering in Nuxt.
::

## What about the Database?

Nuxt Content will load the database in the browser using [WASM SQLite](/docs/advanced/database#wasm-sqlite-in-browser), this way, the content queries happening on client-side navigation or actions will run in the browser.
