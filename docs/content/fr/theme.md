---
title: Utiliser un thème (WIP)
description: 'Ajoutez un thème et accélérez votre développement avec Nuxt et @nuxt/content'
category: Thèmes
position: 8
---

<br>
<base-alert type="info">

 **Les thèmes arrivent bientôt** dans [NuxtJS](https://nuxtjs.org), restez informé sur [Twitter](https://twitter.com/nuxt_js) ou [GitHub](https://github.com/nuxt/nuxt.js).

</base-alert>

La configuration ressemblera à ceci:

<code-group>
  <code-block label="Yarn" active>

```bash
  yarn add @nuxtjs/theme-everest
```

</code-block>
  <code-block label="NPM">

```bash
  npm install @nuxtjs/theme-everest
```

</code-block>
</code-group>

Ajoutez ensuite votre thème dans votre fichier `nuxt.config.js`:

```js[nuxt.config.js]
export default {
  theme: '@nuxtjs/theme-everest'
}
```

Enfin, vous pourrez commencer à écrire dans le répertoire `content/` et profiter d'un magnifique site web de documentation, blog, portfolio, et plus encore !
