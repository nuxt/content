---
title: Commands
description: Usage description for each of the Docus repository commands.
---

This page will list all the available commands for Docus repository.

These commands can be run using `pnpm` which is the package manager of this repository.

```bash
pnpm build
```

## Commands

### `build`

Runs the package build using [`unbuild`](https://github.com/unjs/unbuild).

```bash
pnpm build
```

### `build:docs`

Runs the documentation build using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
pnpm build:docs
```

### `build:theme`

Runs the theme build using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
pnpm build:theme
```

### `build:examples`

Runs the examples build using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
pnpm build:examples
```

### `dev`

Runs the documentation dev env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
pnpm dev
```

### `dev:theme`

Runs the theme dev env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
pnpm dev:theme
```

### `dev:examples`

Runs the examples dev env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
pnpm dev:examples
```

### `start:docs`

Runs the documentation prod env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

Has to be runned after `build:docs`.

```bash
pnpm start:docs
```

### `start:theme`

Runs the theme prod env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

Has to be runned after `build:theme`.

```bash
pnpm start:theme
```

### `start:examples`

Runs the examples prod env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

Has to be runned after `build:examples`.

```bash
pnpm start:examples
```

### `lint`

Runs [ESLint](https://eslint.org/) on all `js`, `ts` and `.vue` files.

ESLint is configured to work with [Prettier](https://prettier.io).

We also use [@nuxtjs/eslint-config-typescript](https://www.npmjs.com/package/@nuxtjs/eslint-config-typescript).

```bash
pnpm lint
```

### `test`

Runs both test suites, **E2E** and **unit**.

```bash
pnpm test
```

### `test:unit`

Runs unit tests with [Vitest](https://vitest.dev).

```bash
pnpm test:unit
```

### `test:e2e`

Runs end to en tests with [Cypress](https://www.cypress.io).

```bash
pnpm test:e2e
```

### `test:e2e:gui`

Runs end to en tests with [Cypress](https://www.cypress.io) and opens its GUI.

```bash
pnpm test:e2e:gui
```

### `coverage`

Runs coverage calculation with [Vitest](https://vitest.dev).

```bash
pnpm coverage
```

### Prepare

Setup Git Hooks with [Husky](https://github.com/typicode/husky).

```bash
pnpm prepare
```

### `cy:open`

Shorthand to [`cypress open`](https://docs.cypress.io/guides/guides/command-line#cypress-open) command.

```bash
pnpm cy:open
```

### `cy:run`

Shorthand to [`cypress run`](https://docs.cypress.io/guides/guides/command-line#cypress-run) command.

```bash
pnpm cy:run
```

### `version:change`

Run [`beachball change`](https://microsoft.github.io/beachball/cli/change.html) command.

```bash
pnpm version:change
```

### `version:bump`

Run [`beachball bump`](https://microsoft.github.io/beachball/cli/bump.html) command.

```bash
pnpm version:bump
```

### `version:bump-edge`

Run [`bump-edge`](https://github.com/docusgen/docus/blob/2ca5f4dfdecd05f9a62f52faca80e0781eb828d0/.github/scripts/bump-edge.ts) script.

```bash
pnpm version:bump-edge
```

### `version:check`

Run [`beachball check`](https://microsoft.github.io/beachball/cli/check.html) command.

```bash
pnpm version:check
```

### `version:publish`

Run [`beachball publish`](https://microsoft.github.io/beachball/cli/publish.html) command.

```bash
pnpm version:publish
```
