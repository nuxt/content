---
title: Docus, the Comeback
description: The Nuxt documentation theme and CLI is back with version 3
  rewritten from the ground up.
seo:
  title: Docus v3 — The Return of the Nuxt Docs Theme
date: 2025-06-13T00:00:00.000Z
category: content
image:
  src: https://docus.dev/__og-image__/static/og.png
  alt: Docus Landing Page
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
---

We’ve completely rewritten the [Docus](https://docus.dev) theme. Reviving it with a fresh and modern foundation powered by the Nuxt ecosystem and designed by Nuxt UI to offer the best documentation experience.

The goal was simple: take **the best parts of the Nuxt ecosystem** and deliver a documentation theme that’s powerful, elegant and easy to maintain.

## **What’s New in Docus v3?**

### **📦 A real** [Nuxt]{.text-primary} **app with just one dependency**

Docus is built on top of [Nuxt 3](https://nuxt.com) (version 4 compatibility mode is enabled so we're already ready for Nuxt 4). That means your documentation is a full Nuxt application with access to the entire Nuxt features: components, modules, plugins, runtime config, and more.

**But**, **the best part is**... You only need the **docus** package. It bundles all the necessary officials Nuxt modules, so you can start writing documentation in seconds. All you need in your app is a `package.json` file and a `content/` folder with your Markdown in it. Then you’re good to go.

::prose-tip{to="https://docus.dev/concepts/nuxt"}
Learn more about Nuxt layer in Docus dedicated section.
::

### **✨ Designed by** [Nuxt]{.text-primary} **UI Pro**

Docus v2 is powered by **Nuxt UI Pro**, giving you a beautiful, responsive, and accessible theme out of the box. With **Tailwind CSS v4**, **CSS variables**, and the **Tailwind Variants API**, your docs look great by default but stays fully customizable.

You can tweak colors, update typography or adjust component styles globally or per component with simple updates in your `app.config.ts`.

::prose-tip{to="https://docus.dev/concepts/theme"}
Learn more about UI theming in Docus dedicated section.
::

::prose-note
A UI Pro license is currently required, but we’re working to make it free for everyone soon. Also, if you're currently building an OSS documentation, you can ask for the OSS license at `ui-pro@nuxt.com` .
::

### **✍️ Markdown with superpowers (MDC syntax by** [Nuxt]{.text-primary} **Content)**

Writing docs has never been more simple. You're one Markdown folder away from it. Furthermore with Nuxt Content and the MDC syntax, you can embed interactive Vue components in Markdown and use any Nuxt UI components or your own custom ones.

::prose-tip{to="https://docus.dev/concepts/edition"}
Learn more about MDC syntax in Docus dedicated section.
::

### 🖥️ [Nuxt]{.text-primary} Studio ready

Docus works perfectly with **Nuxt Studio**, allowing you to manage and edit your docs entirely from the browser. No terminal, no local setup. It’s the ideal way to collaborate with non-technical contributors or manage docs centrally for your team.

::prose-tip{to="https://docus.dev/getting-started/studio"}
Learn more about Studio editor in Docus dedicated section.
::

### **🔍 SEO out of the box**

Technical SEO is tricky and boring. Docus offers a solid, opt-in default setup that works out of the box while giving you full control to customize your SEO metadata, from pages metas to social sharing images.

::prose-tip{to="https://docus.dev/concepts/configuration"}
Learn more about app configuration in Docus dedicated section.
::

### **🔧 Full customization via component overrides**

Need to replace parts of the layout or UI? Docus uses **Nuxt Layers** to let you override core components we've defined. Just create a new component in your project’s `components/` directory using the same name, and Docus will automatically use it.

::prose-tip{to="https://docus.dev/concepts/customization"}
Learn more about components override in Docus dedicated section.
::

### **🤖** LLMs integration by default

Docus integrates `nuxt-llms` by default to prepare your content for Large Language Models (LLMs). All your documentation pages are injected and `/llms.txt` file is automatically generated and pre-rendered.

::prose-tip{to="https://docus.dev/concepts/llms"}
Learn more about LLMs integration in Docus dedicated section.
::

### **🧠 Smart defaults for a ready docs**

Docus includes thoughtful defaults that save you time:

- ✅ Auto-generated sidebar navigation from your folder structure
- 🔍 Full-text search using Fuse.js
- ✨ Optimized typography and layout
- 🌙 Dark mode support out of the box
- 🖼️ Nuxt Image integration for responsive, optimized images

### **🔁** Easy migration

Moving from any Markdown-based is straightforward: drop your `.md` files into your `content/` folder and you’re live.

## **What’s Next?**

### **🔧 Try Docus Today**

```bash
npx docus init docs
```

That's it 🚀 You're ready to edit your `content/` folder and start writing your doc.

::prose-tip{to="https://docus.dev"}
Visit the documentation to learn everything about Docus.
::

### **🤝 Contribute**

We’ve moved the repository to the **NuxtLabs** GitHub organization and cleaned up the issue tracker to start fresh.

Whether you’re fixing bugs, suggesting features, or writing docs, we’d love your help. Feedback, contributions, and discussions about the future of Docus are all welcome!
