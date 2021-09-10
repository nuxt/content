---
title: "NuxtJS: From Terminal to Browser"
description: How we changed the developer experience to stop switching between the terminal and browser.
imgUrl: blog/nuxtjs-from-terminal-to-browser/main.png
date: 2019-06-04
authors:
  - atinux
tags:
    - webpack
    - DX
---

How we changed the developer experience to stop switching between the terminal and browser.

> Nuxt.js is a Vue.js framework to create different kind of web applications with the **same directory structure & conventions**: Universal, Single Page, PWA or Static Generated.

_ℹ️ These features are all available with [v2.8.0 release](https://github.com/nuxt/nuxt.js/releases/tag/v2.8.0)._

## Problems

1.  Developing JavaScript applications with Webpack or any bundler requires to switch between your browser and terminal for debugging purpose.
2.  Using `console.log` to debug when the app is server rendered requires to remember that logs will be displayed on the terminal when refreshing the page.

## Solutions

1.  Forwarding Webpack build state right in the browser and display them in a fancy manner.

[![foward-webpack-build-state](https://res.cloudinary.com/practicaldev/image/fetch/s--1u6wSHPt--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/58880743-ec7a3280-86d8-11e9-8856-8d9d22b89b70.gif)](https://res.cloudinary.com/practicaldev/image/fetch/s--1u6wSHPt--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/58880743-ec7a3280-86d8-11e9-8856-8d9d22b89b70.gif)

1.  Same for Hot Module Replacement (really useful when the project gets bigger and takes more time to re-build).

[![nuxt-build-indicator-hmr](https://res.cloudinary.com/practicaldev/image/fetch/s--faVtF222--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/58547105-129a6100-8207-11e9-9c61-a93956a17727.gif)](https://res.cloudinary.com/practicaldev/image/fetch/s--faVtF222--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/58547105-129a6100-8207-11e9-9c61-a93956a17727.gif)

1.  Forwarding SSR logs to the browser in development mode

[![nuxt-ssr-logs-forwarding](https://res.cloudinary.com/practicaldev/image/fetch/s--bwQ8iEq2--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/58566291-a3396700-8230-11e9-9dd6-09c3ff8578d2.gif)](https://res.cloudinary.com/practicaldev/image/fetch/s--bwQ8iEq2--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://user-images.githubusercontent.com/904724/58566291-a3396700-8230-11e9-9dd6-09c3ff8578d2.gif)

## NuxtJS Vision

The purpose to these changes is to use the terminal for commands only.

Now you can focus right on your code and its visual result 🙂

> Be lazy, be smart, be Nuxt.

Links:

*   Documentation: [https://nuxtjs.org](https://nuxtjs.org)
*   GitHub: [https://github.com/nuxt/nuxt.js](https://github.com/nuxt/nuxt.js)
*   Loading Screen source code: [https://github.com/nuxt/loading-screen](https://github.com/nuxt/loading-screen)
*   Twitter: [https://twitter.com/nuxt_js](https://twitter.com/nuxt_js)