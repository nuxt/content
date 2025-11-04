---
title: Nuxt Studio Alpha Release
description: Introducing the first alpha release of Nuxt Studio as a free, open-source Nuxt module. Edit your content in production with GitHub integration and real-time preview.
date: 2025-11-04
image:
  src: /blog/studio-module-alpha.png
  alt: Nuxt Studio Alpha Release
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
category: Release
---

When NuxtLabs joined Vercel, we promised to transform [nuxt.studio](https://nuxt.studio) from a hosted platform into a free, open-source module. Today, we're excited to announce the **first alpha release** of the Nuxt Studio module.

You can now enable content editing directly in production, with real-time preview and GitHub integration, all from within your own Nuxt application.

::prose-note
The alpha version includes a Monaco code editor for Markdown, YAML, and JSON files. The visual Notion-like editor will arrive in the beta release.
::

## From Hosted Platform to Self-Hosted Module

This milestone wouldn't have been possible without Vercel's support. Their backing allowed us to dedicate the resources needed to rebuild Studio as an open-source module.

### What's Different?

Originally offered as a hosted platform at [nuxt.studio](https://nuxt.studio), Studio has evolved into an open-source Nuxt module that you can deploy alongside your Nuxt Content website.

This means content editors can manage and update content directly in production, on your website, without the need of local development tools or Git knowledge.

- **Self-hosted** — runs entirely on your infrastructure alongside your Nuxt app
- **No external dependencies** — no APIs or third-party services required
- **Free and open-source** — released under the MIT license
- **Direct integration** — a simple GitHub OAuth app is needed to get started

::warning
The only trade-off is that Studio now requires a server-side route for authentication. While static generation remains supported with [Nuxt hybrid rendering](https://nuxt.com/docs/4.x/guide/concepts/rendering#route-rules), your site must be deployed on a platform that supports SSR.
::

## What's Shipped in Alpha

The alpha release focuses on **core infrastructure and stability** without risking any bugs introduced by the Visual editor. We're using Monaco editor to ensure all file operations and GitHub workflows are rock-solid before introducing visual editing.

**Monaco Code Editor**
Professional editing experience with syntax highlighting for Markdown, YAML, and JSON, including full MDC syntax support and split-screen diff viewer for conflicts.

**File Operations**
Complete CRUD operations for your `content/` directory—create, edit, delete, rename, and move files with built-in draft management.

**Media Management**
Centralized library for assets in your `public/` directory with upload, organize, preview, and integrate capabilities.

**Git Integration**
Direct commits to GitHub via OAuth with conflict detection, author attribution, and custom commit messages.

**Real-time Preview**
Live preview of draft changes on your production website with instant updates and side-by-side editing.

## The Road Ahead

### Beta Release `Q4 2025`

Inspired from what we've built on [nuxt.studio](https://nuxt.studio), the beta phase will introduce the open-source visual editor, making Studio accessible to non-technical users:

- **Visual Editor** — Notion-inspired WYSIWYG experience for Markdown
- **Form-based Editing** — Schema-based forms for Markdown frontmatter, YAML, and JSON files
- **Vue Component Edition** — Visual interface for editing component props and slots
- **Google OAuth** — Alternative authentication for non-GitHub users

### Stable Release `End of Year 2025`

Production-ready features, performance optimizations, and enhanced stability.

### Beyond `2026`

AI-powered content suggestions, multiple git providers, and community-driven features.

## Dig deeper

### How the sync works

Studio uses a three-tier storage architecture to keep content synchronized between your browser and GitHub.

### Production Database `SQLite WASM`

When your Nuxt Content website loads, Nuxt Content v3 downloads a SQLite database dump from your server and initializes a local WASM database containing all content from your deployed branch. This database stays in sync with GitHub as long as your last deployment completed successfully. This is the production database that is used updated by Studio when you edit content.

### Draft Storage `IndexedDB`

Studio maintains a separate draft layer using [unstorage](https://unstorage.unjs.io/) backed by IndexedDB. When you edit content, changes are stored as drafts locally in your browser. Each time Studio loads, these drafts are merged with the SQLite database to render a drafted version of your production site.

::note
Drafts are stored only in your browser. They're not shared between editors or devices.
::

### GitHub Repository `API Integration`

When you publish, Studio commits your draft changes directly to GitHub through the GitHub API. Your CI/CD pipeline then rebuilds and redeploys your site automatically. After deployment, you'll need to refresh to update your browser database with the latest content.

### The Sync Flow

1. **Initial Load:** SQLite database downloaded + existing drafts recovered from IndexedDB
2. **Editing:** Changes saved to IndexedDB + local SQLite database updated for instant preview
3. **Conflict Detection:** Draft content compared against latest GitHub version
4. **Publishing:** Drafts committed to GitHub → CI/CD triggered → site rebuilds
5. **Post-Deploy:** Studio clears drafts and waits for deployment to complete

::tip
Studio will automatically notify you when a new deployment is detected and your database needs refreshing.
::

## Get Started Today

Install the module and configure your GitHub OAuth app to start editing content in production:

```bash
npx nuxi module add nuxt-studio
```

Check out the [setup guide](/docs/studio/setup) for complete installation and configuration instructions.

---

We're excited to see what you build with Nuxt Studio. Join the conversation on [GitHub Discussions](https://github.com/nuxt-content/studio/discussions) or [join our Discord](https://discord.gg/sBXDm6e8SP) to help shape the future of the module.

