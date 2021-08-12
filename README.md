# Docus Core

The Docus core.

## Quick Setup

This package is usually setup via [@docus/app](https://github.com/docusgen/docus).

You can still install it manually into your own stack, but won't benefit from the presets offered by Docus app.

1. Add `@docus/core` dependency to your project:

```bash
# Using Yarn
yarn add --dev @docus/core
# Using NPM
npm install --save-dev @docus/core
```

2. Add `@docus/core` to the `buildModules` section of your `nuxt.config.js`

```ts
{
  buildModules: ['@docus/core']
}
```

## Description

This package provides:

- Markdown parsing
- Markdown content querying
- Markdown content HMR
- Navigation generation
- Remark and plugins implementations
- MDC Syntax
- DocusContent, Markdown, Props components
