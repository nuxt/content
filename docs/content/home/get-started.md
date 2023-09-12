---
navigation: false
---

You can start a fresh Nuxt Content project with:

::code-group
```bash [npx]
npx nuxi@latest init content-app -t content
```

```bash [pnpm]
pnpm dlx nuxi@latest init content-app -t content
```
::

Install the dependencies in the `content-app` folder:

::code-group
```bash [pnpm]
pnpm install --shamefully-hoist
```

```bash [yarn]
yarn install
```

```bash [npm]
npm install
```
::

Now you'll be able to use `pnpm dev` to start your Nuxt content app in development mode:

::code-group
```bash [pnpm]
pnpm run dev
```

```bash [yarn]
yarn dev
```

```bash [npm]
npm run dev
```
::
