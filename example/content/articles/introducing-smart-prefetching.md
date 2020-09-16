---
title: Introducing Smart Prefeching
description: "Starting from Nuxt v2.4.0, Nuxt.js will automagically prefetch the code-splitted pages linked with a nuxt-link when visible in the viewport by default."
imgUrl: blog/introducing-smart-prefetching/main.png
date: 2019-01-28
authors:
  - atinux
tags:
    - framework
    - feature
    - performance
---

## Introducing Smart prefetching ⚡️

Starting from [Nuxt v2.4.0](https://github.com/nuxt/nuxt.js/releases/tag/v2.4.0), Nuxt.js will automagically prefetch the code-splitted pages linked with `<nuxt-link>` when visible in the viewport **by default**. This hugely improves the end user performances, inspired by [quicklink](https://github.com/GoogleChromeLabs/quicklink).

[![nuxt-prefetch-comparison](https://res.cloudinary.com/practicaldev/image/fetch/s--jP7Crsw7--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/51692960-4158be80-1ffe-11e9-9299-61881d06412e.gif)](https://res.cloudinary.com/practicaldev/image/fetch/s--jP7Crsw7--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/51692960-4158be80-1ffe-11e9-9299-61881d06412e.gif)

Demos are online and we recommend you to try it out to feel the difference:

*   No prefetching (v2.3): [https://nuxt-no-prefetch.surge.sh](https://nuxt-no-prefetch.surge.sh)
*   With prefetching (v2.4): [https://nuxt-prefetch.surge.sh](https://nuxt-prefetch.surge.sh)

You can learn more about this feature in the [`<nuxt-link>`](/api/components-nuxt-link) section of the documentation.