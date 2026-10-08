---
title: Nuxt Content v3 — layers
description: Les collections sont chargées depuis le content.config.ts de chaque layer.
---

# Nuxt Content v3 — layers

Cette page d'accueil provient de la collection `landing_fr` déclarée par le `content.config.ts` du **layer**.
Le layer lit les locales i18n avec `useNuxt()` et déclare une collection par locale.

- La [documentation](/fr/docs/getting-started/installation) est servie par la collection `docs_fr` du layer.
- Le [changelog](/fr/changelog/v1) est servi par `changelog_fr`, issu du `content.config.ts` du **projet**.
