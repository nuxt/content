---
title: Serverless Hosting
description: How to deploy Nuxt Content on various serverless platforms.
navigation:
  title: Serverless
---

## What is Serverless Hosting?

Serverless hosting lets you run code and applications without managing servers directly - you just upload your code and the cloud provider automatically handles all the infrastructure, scaling, and maintenance while charging you only for the actual compute resources you use.

**In serverless environments, each user request triggers a fresh instance of your Nuxt server, meaning it starts from scratch every time.** This "stateless" nature means you can't store data in server memory or use file-based databases like SQLite. That's why we need to use external database services (like D1, Turso, or PostgreSQL) that persist data independently of your server instances.

## Deploy with Serverless

### 1. Select a database service

Before deploying your project, you need to select a database service:

::code-group

```ts [PostgreSQL]
// 1. Create a PostgreSQL database
// 2. And add the `POSTGRES_URL` to the env variables
export default defineNuxtConfig({
  content: {
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL
    }
  }
})
```
```ts [Cloudflare D1]
// 1. Create a D1 database in your CF account
// 2. Link it to your project with the same binding name
export default defineNuxtConfig({
  content: {
    database: {
      type: 'd1',
      binding: '<YOUR_BINDING_NAME>'
    }
  }
})
```
```ts [LibSQL]
// 1. Create a LibSQL database on Turso.tech
// 2. And add the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env variables
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    database: {
      type: 'libsql',
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }
  }
})
```
```ts [NuxtHub]
// Install the NuxtHub module (see hub.nuxt.com)
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxthub/core'],
  content: {
    database: {
      type: 'd1',
      binding: 'DB'
    }
  },
  hub: {
    database: true
  }
})
```
::

### 2. Deploy your project

Nuxt Content uses Nuxt deployment presets to adjust the build process for different hosting platforms.

Various serverless platform are supported with zero configuration:

- [Cloudflare](https://nuxt.com/deploy/cloudflare)
- [NuxtHub](https://nuxt.com/deploy/nuxthub)
- [Vercel](https://nuxt.com/deploy/vercel)
- [Netlify](https://nuxt.com/deploy/netlify)

All you need to do is to set the build command to:

```bash [Terminal]
nuxi build
```

The generated output will be compatible with the selected platform.

::note
The linked database will be loaded on the server side when booting the server. In the browser, a [WASM SQLite](/docs/advanced/database#wasm-sqlite-in-browser) database will be loaded for client-side navigation and actions.
::

### 3. Optimize with pre-rendering

As each request trigger a fresh instance of your Nuxt server, the performance of your serverless application will be impacted if you don't pre-render some pages.

To optimize your serverless application, you can pre-render your pages using the `routeRules` option:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true }
  }
})
```

::tip{to="https://hub.nuxt.com/docs/recipes/pre-rendering"}
We recommend to checkout **NuxtHub's Pre-rendering guide** to learn more about the different strategies to optimize your serverless application, it applies to all serverless platforms.
::
