---
title: Introduction
description: 'Empower your NuxtJS application with @nuxt/content module: write in a content/ directory and fetch your Markdown, JSON, YAML and CSV files through a MongoDB like API, acting as a Git-based Headless CMS.'
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
  - Handles Markdown, CSV, YAML, JSON(5), XML
  - Extend with hooks
csb_link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

Empower your NuxtJS application with `@nuxt/content` module: write in a `content/` directory and fetch your Markdown, JSON, YAML, XML and CSV files through a MongoDB like API, acting as a **Git-based Headless CMS**.

## Features

<base-list :items="features"></base-list>

<p class="flex items-center">Enjoy light and dark mode: <color-switcher class="p-2"></color-switcher></p>

## Videos

Demonstration of using `$content` and `<nuxt-content>` to display Markdown pages:

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.ogv" type="video/ogg" />
</video>

<br>

Using `$content()` on a directory to list, filter and search content:

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.ogv" type="video/ogg" />
</video>

## Online playground

<code-sandbox :src="csb_link"></code-sandbox>
