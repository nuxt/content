---
title: Nuxt Studio is Now Free and Open Source
description: We're officially releasing Nuxt Studio as a free, open-source, self-hosted module. The legacy nuxt.studio platform is being sunset and now becomes the official documentation. Your content editing experience continues, now on your own terms.
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
  - name: Ahad Birang
    avatar:
      src: https://avatars.githubusercontent.com/u/2047945?v=4
    to: https://x.com/farnabaz
    username: farnabaz
  - name: Sébastien Chopin
    avatar:
      src: https://avatars.githubusercontent.com/u/904724?v=4
    to: https://x.com/atinux
    username: atinux
categories: []
category: release
date: 2026-01-05
draft: false
image:
  src: /blog/Nuxt-Studio-is-Dead.png
  alt: Nuxt Studio Official Release
seo:
  title: Nuxt Studio is Now Free and Open Source
  description: We're officially releasing Nuxt Studio as a free, open-source, self-hosted module. The legacy nuxt.studio platform is being sunset. Your content editing experience continues, now on your own terms.
---

**Nuxt Studio is dead, long live Nuxt Studio.**

We promised to deliver by the end of the 2025 year and today we're keeping that promise: we're officially releasing the first stable version of Nuxt Studio as a **free, open-source Nuxt module**. At the same time, we're sunsetting the legacy [nuxt.studio](https://nuxt.studio) platform. It now becomes the new official documentation.

::u-button
---
color: neutral
icon: i-simple-icons-github
target: _blank
to: https://github.com/nuxt-content/nuxt-studio
variant: outline
---
Discover the Nuxt Studio module on GitHub.
::

## 🌄 Why We're Sunsetting [nuxt.studio](https://nuxt.studio)

When NuxtLabs joined Vercel, we promised to make our premium products free and open source.We're following the same approach already taken with [Nuxt UI](https://ui.nuxt.com) and soon applied to [NuxtHub](https://hub.nuxt.com).

For us, this means everything. It's the opportunity to focus entirely on building tools that are **free, open source, and accessible to everyone**.

This is why Studio platform will be discontinued.

## 🚀 Meet the New Studio Module

We rebuilt Studio from the ground up as a Nuxt module. The result is a fully self-hosted content management solution that runs alongside your Nuxt Content website.

::u-button
---
class: mt-4
color: neutral
icon: i-lucide-mouse-pointer-click
to: /admin?redirect=/blog/studio-oss
---
Try editing this page
::

### What's Different?

- **Self-hosted** — runs entirely on your infrastructure alongside your Nuxt app
- **Free and open-source** — released under the MIT license
- **Dev integration** — works also in development mode

## 📦 Features

This stable release includes everything you need to edit content in production:

### TipTap Visual Editor

The modern Notion-like editing experience for Markdown content is back with a improved version, powered by [TipTap](https://tiptap.dev/) integrated through the [Nuxt UI Editor](https://ui.nuxt.com/pro/components/editor) component:

- Rich text editing with headings, formatting, links, and more
- MDC component support for inserting Vue components
- Vue component props editor for visual property editing
- Drag & drop for reordering content blocks
- Slash commands for quick formatting access
- Real-time conversion between visual content and MDC syntax

### Form-Based Editor

Schema-based forms automatically generated from your [collection definitions](/docs/collections/define):

- Automatic form generation for frontmatter, YAML, and JSON files
- Custom inputs for media and icon selection
- Native type mapping (string → text, boolean → toggle, enum → select)
- Array support and object support

### File Operations

Complete CRUD operations for your `content/` directory: create, edit, delete, rename, and move files with built-in draft management.

### Media Management

Centralized media library for assets in your `public/` directory with upload, organize and preview.

### Git Integration

Direct commits to GitHub or GitLab with conflict detection, author attribution, and custom commit messages.

### Real-time Preview

Live preview of draft changes on your production website with instant updates and side-by-side editing.

### Multi-Language Support

The Studio interface is available in 17 languages including English, French, German, Spanish, Japanese, Chinese, and more.

### Authentication Options

Multiple authentication providers: GitHub OAuth, GitLab OAuth, Google OAuth, or custom authentication with your own flow.

## 📦 Quick Start

Install the module using the Nuxt CLI:

```bash [Terminal]
npx nuxt module add nuxt-studio
```

Start editing in local or configure your repository for production:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  studio: {
    repository: {
      provider: 'github',
      owner: 'your-username',
      repo: 'your-repo',
      branch: 'main'
    }
  }
})
```

::tip{to="https://nuxt.studio/setup"}
Follow the complete setup guide for detailed installation instructions.
::

## 📅 Sunset Timeline

::prose-steps
### Now

You can already migrate to the new module. All existing subscription have been canceled.

### 2026

The legacy nuxt.studio platform becomes the new official documentation and we'll keep improving this module day after day.
::

::note
The [nuxt.studio](http://nuxt.studio) platform has always been just an editing layer. Your content lives in your Git repository and you remain in full control. The sunset of the platform will have zero impact on your deployed website or its behaviour.
::

## 🔄 Migration Guide

Migration is extremely simple:

1. **Install the module**: Follow the [setup documentation](https://nuxt.studio/setup)
2. **Configure authentication**: Set up [GitHub](https://nuxt.studio/git-providers#github), [GitLab](https://nuxt.studio/git-providers#gitlab), or [Google OAuth](https://nuxt.studio/auth-providers#google)
3. **Remove legacy code**: Upcoming versions of Nuxt Content will automatically remove all legacy Studio code, but you can already remove the `preview` key in your Nuxt Content configuration.

## 🗺 What's Next

We're committed to making the open-source module an even better experience. Here's what's coming in 2026:

- **AI-powered content generation** — intelligent content suggestions and assistance
- **TipTap extension exposal** — we'll expose the TipTap extensions we've built (related to MDC syntax) so you can use it with the [Nuxt UI Editor](https://ui.nuxt.com/docs/components/editor).
- **Community-driven features** — shaped by your feedback

## 🙏 Thank You

Your feedback shaped both the old and new Studio. Your support made this transition possible.

Thanks to Vercel for making this happen. Their pushing towards open source.

We're excited to see what you build with the new Nuxt Studio module. Join the conversation on [GitHub Discussions](https://github.com/nuxt-content/nuxt-studio/discussions) or [join our Discord](https://discord.gg/sBXDm6e8SP) to help shape the future of content editing.

---

If you need help migrating, reach out on our [Discord server](https://discord.gg/sBXDm6e8SP).
