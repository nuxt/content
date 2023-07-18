[![nuxt-content](https://user-images.githubusercontent.com/904724/221176888-d9efefbe-0a8a-4d6b-beb2-5cc7d7dcad05.png)](https://content.nuxtjs.org)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Volta][volta-src]][volta-href]

# Nuxt Content

Nuxt Content reads the `content/` directory in your project, parses `.md`, `.yml`, `.csv` or `.json` files and creates a powerful data layer for your application. Bonus, use Vue components in Markdown with the [MDC syntax](https://content.nuxtjs.org/guide/writing/mdc).

- [📖 &nbsp;Read the documentation](https://content.nuxtjs.org)
- [👾 &nbsp;Playground](https://stackblitz.com/github/nuxt/content/tree/main/examples/essentials/hello-world?file=app.vue)
- [✨ &nbsp;Intro video](https://www.youtube.com/watch?v=o9e12WbKrd8)
- [✍️ &nbsp;Nuxt Studio](https://nuxt.studio)

## Features

- [**Nuxt 3**](https://nuxt.com) support
- A Markdown syntax made for Vue components ([**MDC**](https://content.nuxtjs.org/guide/writing/mdc))
- Navigation generation
- Code highlighting with [**Shiki**](https://shiki.matsu.io)
- Blazing fast hot module replacement in development
- Powerful query builder (MongoDB like)
- Table of contents generation
- Also handles CSV, YAML and JSON(5)
- Extend with hooks and content plugins
- [... and more](https://content.nuxtjs.org)

## Nuxt 2

Nuxt 2 is supported with Content v1, documentation is on <https://content.nuxtjs.org/content-v1> and the code on the [v1](https://github.com/nuxt/content/tree/v1) branch.

## 💻 Development

- Clone repository
- Install dependencies using `pnpm install`
- Prepare using `pnpm prepare`
- Prepare using `pnpm build`
- Try playground using `pnpm dev`
- Test using `pnpm test`

**Note:** This repository uses bash scripts for development and testing. If you are on Windows, you can use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) or [Git Bash](https://gitforwindows.org/).

## License

[MIT](./LICENSE) - Made with 💚

[npm-version-src]: https://img.shields.io/npm/v/@nuxt/content/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxt/content

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt/content.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt/content

[license-src]: https://img.shields.io/github/license/nuxt/content.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/nuxt/content/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/nuxt/content?utm_source=readme_nuxt_content
