---
title: Introduction
description: 'Renforcez votre application NuxtJS avec le module @nuxt/content : écrivez dans un répertoire content/ et récupérez vos fichiers Markdown, JSON, YAML et CSV à travers une API de type MongoDB, agissant comme un Headless CMS basé sur Git'
position: 1
category: Pour commencer
features:
  - Rechargement à chaud rapide lors du développement
  - Utilisation de composants Vue dans des fichiers Markdown
  - Recherche plein texte
  - Prise en charge de la génération de site statique avec la commande `nuxt generate`
  - Une puissante API QueryBuilder (type MongoDB)
  - Coloration syntaxique des blocs de code dans les fichiers Markdown à l'aide de PrismJS
  - Génération de la table des matières
  - Prend en charge les fichiers Markdown, CSV, YAML, JSON(5)
  - Possibilité d'extension à l'aide de hooks
csb_link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

Renforcez votre application NuxtJS avec le module `@nuxt/content` : écrivez dans un répertoire `content/` et récupérez vos fichiers Markdown, JSON, YAML et CSV à travers une API de type MongoDB, agissant comme un **Headless CMS basé sur Git**.

## Fonctionnalités

<base-list :items="features"></base-list>

<p class="flex items-center">Profitez des thèmes lumineux et sombre: <color-switcher class="p-2"></color-switcher></p>

## Vidéos

Une démonstration de l'utilisation de `$content` et `<nuxt-content>` pour afficher des fichiers Markdown:

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.ogv" type="video/ogg" />
</video>

<br>

Utilisez `$content()` sur un répertoire afin de lister, filtrer et rechercher du contenu:

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.ogv" type="video/ogg" />
</video>

## Essayer sur CodeSandbox

<code-sandbox :src="csb_link"></code-sandbox>
