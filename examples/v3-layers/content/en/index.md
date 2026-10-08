---
title: Nuxt Content v3 — layers
description: Collections are loaded from the content.config.ts of every layer.
---

# Nuxt Content v3 — layers

This landing page comes from the `landing_en` collection declared by the **layer's** `content.config.ts`.
The layer reads the i18n locales with `useNuxt()` and declares one collection per locale.

- [Docs](/en/docs/getting-started/installation) are served by the layer's `docs_en` collection.
- The [changelog](/en/changelog/v1) is served by `changelog_en`, from the **project's** `content.config.ts`.
