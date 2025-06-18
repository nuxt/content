---
name: Visual YAML and JSON File Edition
title: Visual YAML and JSON File Edition
description: Edit YAML and JSON files with an automatically generated form.
date: 2024-10-28T01:00:00.000Z
image:
  src: /docs/studio/json-yml-forms.png
authors:
  - name: Baptiste Leproux
    to: https://x.com/_larbish
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
category: studio
---

::warning
This article was published before the merge of the [Content](https://github.com/nuxt/content) and [Studio](https://github.com/nuxtlabs/studio-module) modules on January 6, 2025. As a result, it may contain some inconsistencies. The Studio module is now deprecated and available as an opt-in feature of the Content module. Learn how to enable it in [this guide](/docs/getting-started).
::

## Auto-generated form for `YAML` and `JSON` files

:video{controls loop src="https://res.cloudinary.com/nuxt/video/upload/v1730132248/yml-json-form_n9czcs.mp4"}

Continuing our journey to make Nuxt Studio the tool for non-technical users to edit their content with Nuxt websites, we're excited to announce that `YAML` and `JSON` files can now be edited through a generated visual form. This update removes the need for users to interact directly with complex file syntax such as YAML or JSON.

::callout{icon="i-ph-info"}
Arrays are not yet handled as form but we'll work on it once collections and user-defined schemas will be released with Nuxt Content v3. See the section below.
::

### Synchronized navigation

Alongside this update, we’ve improved the synchronized navigation between the preview and selected files for non-Markdown formats (like YAML and JSON). To apply this fixe, please update the Studio module to the latest version `v2.2.0`.

## On the Road to Nuxt Content v3

We’re excited to share that the fourth alpha version of Nuxt Content v3 has been released, with the [**draft documentation**](https://content.nuxt.com/) available.

### What’s Next?

In the coming months, we’ll focus on testing and refining Nuxt Content v3 to ensure a robust, production-ready release. Here’s a quick look at the Nuxt Studio related improvements ahead:

- **Merging the Studio module**: Soon, the Studio module will be integrated directly into Nuxt Content. Once Nuxt Content v3 is released, activating Studio will be as simple as setting `content.editor: true` in your `nuxt.config.ts` file. This simplification means no extra module is required for Studio, making setup faster.
- **Unified documentation**: With the module integration, we’ll also merge the [Content](https://content.nuxt.com) and [Studio](https://nuxt.studio) documentation and websites into one comprehensive resource. Only the Studio platform (available once the user is logged) will remain as a standalone site.
- **Take advantage of data structures and collections in Studio**: With Nuxt Content v3, the Studio platform will support and adapt its behaviour to [collections](/docs/collections/define) and user-defined schemas. This enhancement will allow schema-generated forms for both YAML and JSON files as well as front-matter within Markdown files.

These updates reflect our commitment to providing the best content editing platform for your Nuxt website. Stay tuned!
