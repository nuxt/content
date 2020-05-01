---
title: Introduction
position: 1
category: Getting started
features:
  - Blazing fast hot reload in development
  - Vue components in Markdown
  - Full-text search
  - Support static site generation with `nuxt generate`
  - Powerful QueryBuilder API (MongoDB like)
  - Syntax highlighting to code blocks in markdown files using PrismJS.
  - Table of contents generation
  - Handles Markdown, CSV, YAML, JSON(5)
  - Extend with hooks
csb_link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

`@nuxtjs/content` lets you write in a `content/` directory, acting as **Git-based Headless CMS**.

## Features

<BaseList :items="features"></BaseList>

## Videos

Demonstration of using `$content` and `<nuxt-content>` to display Markdown pages:

<video src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.mp4" loop playsinline controls></video>

Using `$content()` on a directory to list, filter and search content: 

<video src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.mp4" loop playsinline controls></video>

## Online playground

<code-sandbox :src="csb_link"></code-sandbox>
