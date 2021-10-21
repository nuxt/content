---
title: Thèmes de documentation
subtitle: 'Créez une belle documentation comme ce site Web en quelques secondes ✨'
menuTitle: Docs
description: 'Créez votre documentation avec le thème @ nuxt / content docs en quelques secondes!'
category: Themes
position: 8
version: 1.2
badge: 'v0.8.1'
showcases:
  - https://strapi.nuxtjs.org
  - https://tailwindcss.nuxtjs.org
  - https://storybook.nuxtjs.org
  - https://firebase.nuxtjs.org
  - https://pwa.nuxtjs.org
  - https://image.nuxtjs.org
  - https://http.nuxtjs.org
  - https://cloudinary.nuxtjs.org
  - https://i18n.nuxtjs.org
  - https://snipcart.nuxtjs.org
  - https://prismic.nuxtjs.org
  - https://google-analytics.nuxtjs.org
  - https://color-mode.nuxtjs.org
  - https://mdx.nuxtjs.org
  - https://sanity.nuxtjs.org
  - https://speedcurve.nuxtjs.org
---

<alert type="info">

Découvrez [l'exemple en direct](/Exemples/docs-theme)

</alert>

## Pour commencer

Pour commencer rapidement, vous pouvez utiliser le package [create-nuxt-content-docs](https://github.com/nuxt/content/tree/dev/packages/create-nuxt-content-docs).

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn create nuxt-content-docs <project-name>
  ```

  </code-block>
  <code-block label="NPX">

  ```bash
  # Assurez-vous que npx est installé (npx est livré par défaut depuis NPM 5.2.0) ou npm v6.1 ou yarn.
  npx create-nuxt-content-docs <project-name>
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  # À partir de npm v6.1, vous pouvez faire :
  npm init nuxt-content-docs <project-name>
  ```

  </code-block>
</code-group>

Il vous posera quelques questions (nom, titre, url, référentiel, etc.), une fois répondu, les dépendances seront installées. L'étape suivante consiste à accéder au dossier du projet et à le lancer:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  cd <project-name>
  yarn dev
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  cd <project-name>
  npm run dev
  ```

  </code-block>
</code-group>

L'application s'exécute maintenant sur [http://localhost:3000](http://localhost:3000). Bien joué !

## Configuration manuelle

Disons que nous créons la documentation d'un projet open-source dans le répertoire `docs/`.

Le thème est une application NuxtJS classique, vous avez besoin de :

### `package.json`

> Ce fichier peut être créé avec `npm init`.

Installez `nuxt` et `@nuxt/content-theme-docs`:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add nuxt @nuxt/content-theme-docs
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install nuxt @nuxt/content-theme-docs
  ```

  </code-block>
</code-group>

**Exemple**

```json[package.json]
{
  "name": "docs",
  "version": "1.0.0",
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate"
  },
  "dependencies": {
    "@nuxt/content-theme-docs": "^0.11.0",
    "nuxt": "^2.15.8"
  }
}
```

### `nuxt.config.js`

Importez la fonction de thème depuis `@nuxt/content-theme-docs`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  // [additional nuxt configuration]
})
```

Le thème exporte une fonction pour configurer `nuxt.config.js` et vous permet d'ajouter / remplacer la configuration par défaut.

> Consultez la documentation de [defu.arrayFn](https://github.com/nuxt-contrib/defu#array-function-merger) pour voir comment la configuration est fusionnée.

**Exemple**

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  docs: {
    primaryColor: '#E24F55'
  },
  loading: { color: '#00CD81' },
  i18n: {
    locales: () => [{
      code: 'fr',
      iso: 'fr-FR',
      file: 'fr-FR.js',
      name: 'Français'
    }, {
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en'
  },
  buildModules: [
    ['@nuxtjs/google-analytics', {
      id: 'UA-12301-2'
    }]
  ]
})
```

<alert type="warning">

N'oubliez pas d'installer les dépendances des modules que vous ajoutez dans votre `nuxt.config.js`.

</alert>

### `tailwind.config.js`

<badge>v0.4.0+</badge>

Vous pouvez remplacer la [configuration du thème par défaut](https://github.com/nuxt/content/blob/dev/packages/theme-docs/src/tailwind.config.js) en créant le votre dans `tailwind.config.js`.

La conception du thème est basé sur la couleur `primary` pour faciliter le remplacement.

> Les couleurs par défaut sont générées en utilisant [theme-colors](https://github.com/nuxt-contrib/theme-colors) avec `docs.primaryColor` comme base. <badge>v0.7.0+</badge>

**Exemple**

```js[tailwind.config.js]
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // ...
        }
      }
    }
  }
}
```

### `content/`

C'est ici que vous placez vos fichiers de contenu markdown. Vous pouvez en savoir plus dans la section suivante.

### `static/`

C'est ici que vous placez vos fichiers statiques comme le logo.

<alert type="info">

Vous pouvez ajouter un fichier `static/icon.png` pour activer [nuxt-pwa](https://pwa.nuxtjs.org/) et générer un favicon automatiquement.

*L'icône doit être un carré d'au moins 512x512px*

</alert>

<alert type="info">

Vous pouvez ajouter un fichier `static/preview.png` pour avoir une image de prévisualisation dans vos métas.

*L'image doit être au moins 640×320px (1280×640px pour un meilleur affichage).*

</alert>

**Exemple**

```bash
content/
  en/
    index.md
static/
  icon.png
nuxt.config.js
package.json
```

## Contenu

Une fois que vous avez configuré votre documentation, vous pouvez directement commencer à écrire votre contenu.

> Consultez la documentation sur [l'écriture de contenu markdown](/writing#markdown)

### Langues

Le premier niveau de répertoires dans le dossier `content/` correspond aux paramètres de langues utilisés avec [nuxt-i18n](https://github.com/nuxt-community/i18n-module) défini dans votre `nuxt.config.js`. Par défaut, seuls les paramètres de langues par défaut `en` sont définis, vous devez créer un répertoire `content/en/` pour le faire fonctionner.

Vous pouvez remplacer les paramètres de langues dans votre `nuxt.config.js`:

```js[nuxt.config.js]
import theme from '@nuxt/content-theme-docs'

export default theme({
  i18n: {
    locales: () => [{
      code: 'fr',
      iso: 'fr-FR',
      file: 'fr-FR.js',
      name: 'Français'
    }, {
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en'
  }
})
```

<alert type="warning">

Comme expliqué dans la section [nuxt.config.js](/themes/docs#nuxtconfigjs), nous utilisons `defu.arrayFn` pour fusionner votre configuration. Vous pouvez remplacer le tableau `i18n.locales` en utilisant une fonction, ou vous pouvez passer un tableau à concaténer avec celui par défaut (qui n'a que le paramètre de langue `en`).

</alert>

### Routes

Chaque page markdown dans le répertoire `content/{locale}/` deviendra une page et sera répertoriée dans la navigation de gauche.

> Vous pouvez également placer vos fichiers markdown dans des sous-répertoires pour générer des sous-routes. <badge>v0.4.+</badge>

**Exemple**

```
content/
  en/
    Exemples/
      basic-usage.md
    setup.md
```

**Result**

```
/Exemples/basic-usage
/setup
```

> Vous pouvez jeter un oeil à notre [dossier de contenu docs](https://github.com/nuxt/content/tree/dev/docs/content/en) pour avoir un exemple

### Front-matter

Pour le faire fonctionner correctement, assurez-vous d'inclure ces propriétés dans la section front-matter de vos fichiers markdown.

#### Champs obligatoires

- `title` (`String`)
  - Le titre de la page sera injecté dans les métas
- `description` (`String`)
  - La description de la page sera injecté dans les métas
- `position` (`Number`)
  - Ceci sera utilisé pour définir l'ordre des pages dans la navigation

#### Champs facultatifs

- `category` (`String`)
  - Ceci sera utilisé pour regrouper les pages dans la navigation
- `version` (`Float`)
  - Alertez les utilisateurs que la page est nouvelle avec un badge. Une fois la page vue, la version est stockée dans le stockage local jusqu'à ce que vous l'incrémentiez
- `fullscreen` (`Boolean`)
  - Agrandit la page et masque la table des matières
- `menuTitle` (`String`) <badge>v0.4.0+</badge>
  - Remplace le titre de la page qui sera affiché dans le menu de gauche (par défaut `titre`)
- `subtitle` (`String`) <badge>v0.5.0+</badge>
  - Ajoute un sous-titre sous le titre de la page
- `badge` (`String`) <badge>v0.5.0+</badge>
  - Ajoute un badge à côté du titre de la page

### Exemple

```bash[content/en/index.md]
---
title: 'Introduction'
description: 'Empower your NuxtJS application with this awesome module.'
position: 1
category: 'Getting started'
version: 1.4
fullscreen: false
menuTitle: 'Intro'
---

Introducing my awesome Nuxt module!
```

## Réglages

Vous pouvez créer un fichier `content/settings.json` pour configurer le thème.

### Propriétés

- `title` (`String`)
  - Le titre de votre documentation
- `url` (`String`)
  - L'url où votre documentation sera déployée
- `logo` (`String` | `Object`)
  - Le logo de votre projet, peut-être un `Objet` pour définir un logo par [color mode](https://github.com/nuxt-community/color-mode-module)
- `github` (`String`)
  - Le repository GitHub de votre projet `owner/name` pour afficher la dernière version, la page des versions, le lien en haut et le `Editer cette page sur GitHub` sur chaque page. Exemple: `nuxt/content`.
  - Pour GitHub Enterprise, vous devez attribuer une URL complète de votre projet sans barre oblique finale. Exemple: `https://hostname/repos/owner/name`. <badge>v0.6.0+</badge>
- `githubApi` (`String`) <badge>v0.6.0+</badge>
  - Pour GitHub Enterprise, en plus de `github`, vous devez attribuer une URL complète d'API de votre projet sans barre oblique finale. Exemple: `https://hostname/api/v3/repos/owner/name`.
  - Les versions sont extraites de `${githubApi}/releases`.
- `twitter` (`String`)
  - Le nom d'utilisateur Twitter `@username` que vous souhaitez lier. Exemple: `@nuxt_js`
- `defaultBranch` (`String`) <badge>v0.2.0+</badge>
  - La branche par défaut du repository GitHub de votre projet, utilisée dans le lien `Editer cette page sur GitHub` sur chaque page (par défaut `main` s'il ne peut pas être détecté).
- `defaultDir` (`String`) <badge>v0.6.0+</badge>
  - Le répertoire par défaut de votre projet, utilisé dans `Editer cette page sur GitHub` sur chaque page (par défaut `docs`. Peut être une chaîne vide, par exemple. `""`).
- `layout` (`String`) <badge>v0.4.0+</badge>
  - La mise en page de votre documentation (par défaut, `default`). Peut être changé en `single` pour avoir un document d'une seule page.
- `algolia` (`Object`) <badge>v0.7.0+</badge>
  - Cette option vous permet d'utiliser [Algolia DocSearch](https://docsearch.algolia.com) pour remplacer la recherche intégrée simple. Pour l'activer, vous devez fournir au moins le `apiKey` et le `indexName` :
    ```json
    "algolia": {
        "apiKey": "<API_KEY>",
        "indexName": "<INDEX_NAME>",
        "langAttribute": "language"
    }
    ```
  - Si vous utilisez `i18n`, assurez-vous que `<langAttribute>` est le même que le sélecteur de langue html dans la configuration (par défaut, `language`).
  - Jetez un oeil sur [@nuxt/content](https://github.com/algolia/docsearch-configs/blob/master/configs/nuxtjs_content.json) pour la configuration de docsearch comme exemple.

### Exemple

```json[content/settings.json]
{
  "title": "Nuxt Content",
  "url": "https://content.nuxtjs.org",
  "logo": {
    "light": "/logo-light.svg",
    "dark": "/logo-dark.svg"
  },
  "github": "nuxt/content",
  "twitter": "@nuxt_js"
}
```

## Images

Vous pouvez appliquer les classes `dark-img` et `light-img` à vos images lorsque vous avez deux versions à permuter automatiquement en fonction du mode couleur.

**Exemple**

```md
<img src="/logo-light.svg" class="light-img" alt="Logo light" />
<img src="/logo-dark.svg" class="dark-img" alt="Logo dark" />
```

**Result**

<img src="/logo-light.svg" class="light-img" alt="Logo light" />
<img src="/logo-dark.svg" class="dark-img" alt="Logo dark" />

<p class="flex items-center">Essayez de basculer entre le mode clair et sombre :&nbsp;<app-color-switcher class="inline-flex ml-2"></app-color-switcher></p>

## Composants

Le thème est livré avec des composants Vue.js par défaut que vous pouvez utiliser directement dans votre contenu markdown.

> Vous pouvez créer vos propres composants dans le dossier `components/global/`, consultez [cette section](/writing#vue-components). <badge>v0.3.0+</badge>

### `<alert>`

**Props**

- `type`
  - Type: `String`
  - Défaut: `'info'`
  - Valeurs: `['info', 'success', 'warning', 'danger']`

**Exemple**

```md
<alert>

Check out an info alert with a `codeblock` and a [link](/themes/docs)!

</alert>
```

**Result**

<alert>

Check out an info alert with a `codeblock` and a [link](/themes/docs)!

</alert>

### `<list>`

**Props**

- `items`
  - Type: `Array`
  - Défaut: `[]`
- `type` <badge>v0.7.0+</badge>
  - Type: `String`
  - Défaut: `'primary'`
  - Valeurs: `['primary', 'info', 'success', 'warning', 'danger']`
- `icon` <badge>v0.7.0+</badge>
  - Type: `String`
  - *Peut être utilisé pour remplacer l'icône par défaut `type`, consultez les [icônes disponibles](https://github.com/nuxt/content/tree/dev/packages/theme-docs/src/components/global/icons)*

**Exemple**

```md
---
items:
  - Item1
  - Item2
  - Item3
---

<list :items="items"></list>
```

**Result**

<list :items="['Item1', 'Item2', 'Item3']"></list>


### `<badge>`

<badge>v0.5.0+</badge>

**Exemple**

```md
<badge>v1.2+</badge>
```

**Result**

<badge>v1.2+</badge>

### `<code-group>`

Ce composant utilise des `slots`, reportez-vous au `code-block` ci-dessous.

### `<code-block>`

**Props**

- `label`
  - Type: `String`
  - `required`
- `active`
  - Type: `Boolean`
  - Défaut: `false`

**Exemple**

```html
# Backslashes are for demonstration

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content-theme-docs
  \```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content-theme-docs
  \```

  </code-block>
</code-group>
```

**Result**

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxt/content-theme-docs
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxt/content-theme-docs
  ```

  </code-block>
</code-group>

### `<code-sandbox>`

**Props**

- `src`
  - Type: `String`
  - `required`

**Exemple**

```md
---
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---

<code-sandbox :src="link"></code-sandbox>
```

**Result**

<code-sandbox src="https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark"></code-sandbox>

## Showcases

<showcases :showcases="showcases"></showcases>
