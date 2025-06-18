---
title: Introducing Nuxt Studio v2
description: We are excited to announce the v2 release of Nuxt Studio, the new
  editing experience for your Nuxt Content website
image:
  src: /blog/nuxt-studio-v2.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
date: 2024-06-13T00:00:00.000Z
category: studio
---

::warning
This article was published before the merge of the [Content](https://github.com/nuxt/content) and [Studio](https://github.com/nuxtlabs/studio-module) modules on January 6, 2025. As a result, it may contain some inconsistencies. The Studio module is now deprecated and available as an opt-in feature of the Content module. Learn how to enable it in [this guide](/docs/getting-started).
::

We are excited to announce the release of Nuxt Studio v2, a major update bringing a brand new interface designed specifically for our users, based on their feedback.

::tip
Studio is optimized for **Nuxt Content** project but the only real requirement is to have a *content* folder with Markdown files. This simple setup is enough to start editing and publishing your files with the platform.
::

### **A more intuitive interface**

![Nuxt studio v2 interface](/blog/v2-interface.webp)

The main improvement in Version 2 is a **complete rework of the interface**. We have designed it to be more intuitive and user-friendly, especially for non-technical users. Our goal was to simplify the user experience, making it easier to create and set up projects with minimal hassle. The new interface is light, straightforward, and designed to streamline your workflow.

### **Google authentication**

![Google and GitHub authentication](/blog/google-github.webp)

We now have two different authentication methods. You can either login with **GitHub** or with **Google**. Both methods give you the same edition rights but since Studio is synchronized with GitHub, some features are specific to GitHub users, especially project creation.

::warning
Since a Google user can not create a project, he has to **join a team** with existing projects to edit them.
::

### **Minimal setup to edit your files**

You can now edit your content **without any setup**, just import your repository and this is it. You can navigate through your files and medias, edit your content and publish on GitHub.

Collaboration is available for teams.

![Notion-like editor with collaboration](/blog/collaborate.webp)

::warning
Medias in the editor are not displayed until you set up the live preview (see section below).
::

### Simplified setup for live preview

![preview enable between notion like editor and website](/blog/preview.webp)

As the live preview feature requires a deployed URL, we made it as simple as possible to set it up.

While GitHub pages deployment remains available and still does not require any configuration on your end, requirements have been simplified for self-hosted project as we removed the token verification. [Enabling the Studio module](https://nuxt.studio/docs/get-started/setup#enable-the-live-preview) is the **only remaining requirement.**

::warning{to="https://github.com/nuxtlabs/studio-module"}
It's crucial to use the latest version of the **Studio module** to ensure compatibility and access to new features.
::

### New documentation

With a revamped platform comes a [new documentation](https://nuxt.studio/docs/get-started/introduction). Don't hesitate to check it out to learn everything about the new Studio.

Whether you are an [editor](https://nuxt.studio/docs/editors/introduction) or a [developer](https://nuxt.studio/docs/developers/introduction) you now have your dedicated section in the docs.

### A new direction for Studio

Most available CMS solutions have to choose between being very customizable for developers or highly user friendly for content editors, with Studio we want to do both.

**The developer provides the tools for the editors to focus on content, without requiring any technical knowledge**.

::tip
Our Notion-like editor has a bright future ahead, and we want to develop it collaboratively with the community.
::

###
