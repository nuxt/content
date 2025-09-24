[![nuxt-content-social-card](./.github/social-card.png)](https://github.com/oripka/content)

# @ripka/content

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Volta][volta-src]][volta-href]

`@ripka/content` is a fork of [`@nuxt/content`](https://github.com/nuxt/content) that bundles the upstream module with additional encryption helpers. The fork is meant to be a drop-in replacement: it reads the `content/` directory of your Nuxt project, parses `.md`, `.yml`, `.csv` or `.json` files and exposes a typed content database you can query from the app or server. MDC syntax is still supported for authoring Vue components directly inside Markdown content.

- [📖 &nbsp;Read the documentation](https://github.com/oripka/content)
- [✨ &nbsp;Intro video](https://www.youtube.com/watch?v=o9e12WbKrd8)
- [✍️ &nbsp;Nuxt Studio](https://content.nuxt.com/studio)

> ℹ️ This repository still vendors the Nuxt documentation. References to `@nuxt/content` in historical changelog entries are kept for context.

## Installation

Install the module from npm once it has been published under the `@ripka` scope:

```bash
pnpm add @ripka/content
# or
npm install @ripka/content
# or
yarn add @ripka/content
```

Register the module in your Nuxt application exactly like the upstream package:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@ripka/content',
  ],
  content: {
    // configuration remains the same as @nuxt/content
  }
})
```

Every composable and helper can be imported from the new namespace:

```ts
import { queryCollection } from '@ripka/content'
import { defineContentConfig } from '@ripka/content'
import { findPageBreadcrumb } from '@ripka/content/utils'
```

The fork keeps the same runtime structure (`/server`, `/preview`, `/utils`, etc.) so examples from the upstream documentation continue to work after replacing the package name.

If you rely on Nuxt modules that still import `@nuxt/content`, add an override/alias so they resolve to the fork. With pnpm you can add the following snippet to your project `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "@nuxt/content": "npm:@ripka/content@3.7.1-ripka.0"
    }
  }
}
```

Alternatively, configure the same mapping with npm (`overrides`) or yarn (`resolutions`).

## Publishing to npm

1. Ensure you are logged into npm with an account that has access to the `@ripka` organisation: `npm login`.
2. Update the version in [`package.json`](./package.json) if required (for example `npm version patch`).
3. Build the distribution bundle: `pnpm prepack`.
4. Publish the package under the scoped name: `npm publish --access public`.

The repository already declares the `publishConfig.access` property so `npm publish` will default to a public scoped release. After the package is available on npm you can consume it from your Nuxt applications as shown above.

## Features

- [**Nuxt 3**](https://nuxt.com) support
- Works in serverless and edge environments (Cloudflare Workers, etc.)
- Render Vue components in Markdown with the [MDC syntax](https://content.nuxt.com/docs/files/markdown)
- Fully typed collections and queries
- Navigation generation
- Blazing fast hot module replacement in development
- Code highlighting with [**Shiki**](https://github.com/shikijs/shiki)
- Powerful query builder on top of an SQLite database
- Optional encryption helpers for content collections

## 💻 Development

- Clone repository
- Install dependencies using `pnpm install`
- Prepare using `pnpm dev:prepare`
- Build using `pnpm prepack`
- Try playground using `pnpm dev`
- Test using `pnpm test`

## License

[MIT](./LICENSE) - Made with 💚

[npm-version-src]: https://img.shields.io/npm/v/@ripka/content/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@ripka/content

[npm-downloads-src]: https://img.shields.io/npm/dm/@ripka/content.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npm.chart.dev/@ripka/content

[license-src]: https://img.shields.io/github/license/oripka/content.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/oripka/content/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/oripka/content?utm_source=readme_nuxt_content
