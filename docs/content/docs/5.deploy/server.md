---
title: Server Hosting
description: Node preset is the default preset for Nuxt and Nuxt Content. It is used to build and run Nuxt applications on Node.js.
navigation:
  title: Server
---

## What is Node.js preset?

Node preset is the default preset for Nuxt, when building your project, Nuxt will output a Node.js server that you can run with `node .output/server/index.mjs`{lang="ts-type"}.

## Building with Node.js preset

Build project with Nuxt build command:

```bash [Terminal]
nuxi build
```

When running `nuxi build`{lang="ts-type"} with the Node server preset, the result will be an entry point that launches a ready-to-run Node server.

```bash [Terminal]
$ node .output/server/index.mjs
Listening on http://localhost:3000
```

::note
The SQLite database will be loaded on the server side when booting the server as well as in the browser for client-side navigation or actions.
::
