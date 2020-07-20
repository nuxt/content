---
title: Afficher du contenu
description: Vous pouvez utiliser le composant `<nuxt-content>` directement dans vos template afin d'afficher votre Markdown.
position: 5
category: Pour commencer
---

<base-alert type="info">Cette section est dédiée uniquement aux fichiers Markdown</base-alert>

## Composant

Vous pouvez utiliser le composant `<nuxt-content>` directement dans votre template afin d'afficher le contenu de la page:

```vue
<template>
  <article>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </article>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('accueil').fetch()

    return {
      page
    }
  }
}
</script>
```

**Props:**

- document:
  - Type: `Object`
  - `requis`

Vous pouvez en apprendre davantage au sujet de ce que vous pouvez écrire dans vos fichiers Markdown dans la section [écrire du contenu](/writing#markdown).

## Style

En fonction de ce que vous utilisez pour designer vos applications, vous pourrez avoir besoin d'ajouter du style pour afficher votre Markdown correctement.

Le composant `<nuxt-content>` ajoutera automatiquement la classe `.nuxt-content` que vous pourrez utiliser afin d'ajouter votre propre style:

```css
.nuxt-content h1 {
  /* mon propre style h1 */
}
```

Vous pouvez trouver un exemple dans le [répertoire docs](https://github.com/nuxt/content/blob/master/docs/pages/_slug.vue).
