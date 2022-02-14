---
title: Setup
description: Setup the repository locally.
---

## Install dependencies

```bash
yarn install
```

## Type support

We write most of the **@nuxt/content** code using [TypeScript](https://www.typescriptlang.org).

If you want to get full type support from Nuxt 3, you might want to run an initial build of `docs` directory.

Nuxt 3 generate its tsconfig.json on first build, so we need this local build to get full support for type aliases.

```bash
yarn build:docs
```
