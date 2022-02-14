---
title: Commands
description: Usage description for each of the Content repository commands.
---

This page will list all the available commands for Content repository.

These commands can be run using `yarn` which is the package manager of this repository.

```bash
yarn build
```

## Commands

### `build`

Runs the package build using [`unbuild`](https://github.com/unjs/unbuild).

```bash
yarn build
```

### `build:docs`

Runs the documentation build using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
yarn build:docs
```

### `build:examples`

Runs the examples build using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
yarn build:examples
```

### `dev`

Runs the documentation dev env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
yarn dev
```

### `dev:examples`

Runs the examples dev env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

```bash
yarn dev:examples
```

### `start:docs`

Runs the documentation prod env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

Has to be runned after `build:docs`.

```bash
yarn start:docs
```

### `start:examples`

Runs the examples prod env using [`nuxi`](https://v3.nuxtjs.org/getting-started/commands).

Has to be runned after `build:examples`.

```bash
yarn start:examples
```

### `lint`

Runs [ESLint](https://eslint.org/) on all `js`, `ts` and `.vue` files.

We use [@nuxtjs/eslint-config-typescript](https://www.npmjs.com/package/@nuxtjs/eslint-config-typescript).

```bash
yarn lint
```

### `test`

Runs both test suites, **E2E** and **unit**.

```bash
yarn test
```

### `test:unit`

Runs unit tests with [Vitest](https://vitest.dev).

```bash
yarn test:unit
```

### `test:e2e`

Runs end to en tests with [Cypress](https://www.cypress.io).

```bash
yarn test:e2e
```

### `test:e2e:gui`

Runs end to en tests with [Cypress](https://www.cypress.io) and opens its GUI.

```bash
yarn test:e2e:gui
```

### `coverage`

Runs coverage calculation with [Vitest](https://vitest.dev).

```bash
yarn coverage
```

### Prepare

Setup Git Hooks with [Husky](https://github.com/typicode/husky).

```bash
yarn prepare
```

### `cy:open`

Shorthand to [`cypress open`](https://docs.cypress.io/guides/guides/command-line#cypress-open) command.

```bash
yarn cy:open
```

### `cy:run`

Shorthand to [`cypress run`](https://docs.cypress.io/guides/guides/command-line#cypress-run) command.

```bash
yarn cy:run
```

### `version:bump-edge`

Run [`bump-edge`](.github/scripts/bump-edge.ts) script.

```bash
yarn version:bump-edge
```
