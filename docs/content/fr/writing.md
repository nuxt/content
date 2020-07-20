---
title: Écrire du contenu
description: 'Apprenez à utiliser le répertoire content/, prend en charge les fichiers Markdown, YAML, CSV et JSON.'
position: 3
category: Pour commencer
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

Premièrement, créez un répertoire `content/` au sein de votre projet:

```bash
content/
  articles/
    article-1.md
    article-2.md
  accueil.md
```

Ce module analysera les fichiers `.md`, `.yaml`, `.csv`, `.json`, `.json5` et génèrera les propriétés suivantes:

- `dir`
- `path`
- `slug`
- `extension` (ex: `.md`)
- `createdAt`
- `updatedAt`

## Markdown

Ce module convertit vos fichiers `.md` en une arborescence JSON AST, stockée dans une variable `body`.

Assurez-vous d'utiliser le composant `<nuxt-content>` afin d'afficher le `body` de votre contenu Markdown, voir [afficher du contenu](/displaying).

> Vous pouvez consulter le [guide syntaxique de base](https://www.markdownguide.org/basic-syntax) pour apprendre à maîtriser le Markdown.

### Front Matter

Vous pouvez ajouter un bloc YAML front matter à vos fichiers Markdown. Le front matter doit être le premier élément dans le fichier et se doit de respecter une syntaxe YAML valide, entre deux lignes composées de trois tirets. Voici un exemple simple:

```md
---
title: Introduction
description: Apprenez comment utiliser @nuxt/content.
---
```

Ces variables seront injectées au sein du document:

```json
{
  body: Object
  title: "Introduction"
  description: "Apprenez comment utiliser @nuxt/content."
  dir: "/"
  extension: ".md"
  path: "/index"
  slug: "index"
  toc: Array
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Titres

Ce module associe automatiquement un `id` et un `lien` à chaque titre.

Disons que nous avons le fichier Markdown suivant:

```md[home.md]
# Lorem ipsum
## dolor—sit—amet
### consectetur & adipisicing
#### elit
##### elit
```

Il sera transformé en une structure JSON AST, et en utilisant le composant `nuxt-content`, sera rendu en HTML de cette manière:

```html
<h1 id="lorem-ipsum-"><a href="#lorem-ipsum-" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>Lorem ipsum</h1>
<h2 id="dolorsitamet"><a href="#dolorsitamet" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>dolor—sit—amet</h2>
<h3 id="consectetur--adipisicing"><a href="#consectetur--adipisicing" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>consectetur &#x26; adipisicing</h3>
<h4 id="elit"><a href="#elit" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h4>
<h5 id="elit-1"><a href="#elit-1" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h5>
```

> Les liens contenus dans les titres sont vides et donc masqués, il est alors libre à vous de leur apporter du style. Par exemple, essayez de survoler l'un des titre de cette documentation.

### Liens

Les liens sont transformés afin d'y ajouter des attributs `target` et `rel` valides. Vous pouvez modifier ce comportement, voir [configuration](/configuration#markdownexternallinks). Les liens relatifs sont eux aussi transformés automatiquement en `nuxt-link` afin d'apporter une navigation entre pages plus performante à l'aide du smart prefetching.

Voici un exemple illustrant l'utilisation de liens externes et relatifs, en utilisant les syntaxes Markdown et HTML:

```md
---
title: Accueil
---

## Liens

<nuxt-link to="/articles">Nuxt Link vers le Blog</nuxt-link>

<a href="/articles">Lien Html vers le Blog</a>

[Lien Markdown vers le Blog](/articles)

<a href="https://nuxtjs.org">Lien Html externe</a>

[Lien Markdown externe](https://nuxtjs.org)
```

### Notes de bas de page

Ce module prend en charge la syntaxe Markdown avancée pour les notes de bas de page.

Voici un exemple utilisant des notes de bas de page:

```md
Voici une note de bas de page basique,[^1] et en voici une longue.[^bignote]

[^1]: Voici la première note de bas de page.

[^bignote]: En voici une autre, incluant plusieurs paragraphes et du code.

    Indentez les paragraphes pour les inclure dans la note de bas de page.

    `{ mon code }`

    Ajoutez autant de paragraphes que vous le voulez.
```

> Vous pouvez consulter le [guide syntaxique avancé](https://www.markdownguide.org/extended-syntax/#footnotes) pour plus d'informations à propos des notes de bas de page.

### Blocs de code

Ce module enveloppe automatiquement les blocs de code et leur applique des classes propres à [PrismJS](https://prismjs.com) (voir [coloration syntaxique](/writing#syntax-highlighting)).

Dans du Markdown, les blocs de code sont entourés de 3 backticks. Vous pouvez éventuellement définir le langage du bloc de code pour activer la coloration syntaxique associée.

Par défaut, le Markdown ne prend pas en charge les noms de fichiers ou la coloration de lignes particulières au sein des blocs de code. Toutefois, ce module le permet à l'aide de sa propre syntaxe personalisée:

- Coloration des numéros de ligne entre accolades
- Noms de fichiers entre crochets

<pre class="language-js">
```js{1,3-5}[server.js]
const http = require('http')
const bodyParser = require('body-parser')

http.createServer((req, res) => {
  bodyParser.parse(req, (error, body) => {
    res.end(body)
  })
}).listen(3000)
```
</pre>

Voici le résultat après que le composant `nuxt-content` ait généré le rendu:

```html
<div class="nuxt-content-highlight">
  <span class="filename">server.js</span>
  <pre class="language-js" data-line="1,3-5">
    <code>
      ...
    </code>
  </pre>
</div>
```

> Le nom du fichier sera converti en une balise span dôtée de la classe `filename`, libre à vous d'y appliquer du style. Regardez par exemple au sein de cette documentation, au niveau du coin supérieur droit des blocs de code.

### Coloration syntaxique

La coloration syntaxique est prise en charge par défaut grâce à [PrismJS](https://prismjs.com), en injectant le thème défini dans les options de votre application Nuxt.js, voir [configuration](/configuration#markdownprismtheme).

### HTML

Vous pouvez écrire de l'HTML directement dans du Markdown.

```md[home.md]
---
title: Accueil
---

## HTML

<p><span class="note">Un mélange de <em>Markdown</em> et d'<em>HTML</em>.</span></p>
```

Lorsque vous voulez intégrer du Markdown à l'intérieur d'un composant, veillez à ce qu'il soit placé entre deux lignes vides, sinon le bloc sera interprété comme de l'HTML personalisé.

**Ceci ne fonctionnera pas:**

```html
<div class="note">
  *Markdown* et <em>HTML</em>.
</div>
```

**Mais ceci fontionnera:**

```html
<div class="note">

  *Markdown* et <em>HTML</em>.

</div>
```

**Tout comme cela**:

```html
<span class="note">*Markdown* et <em>HTML</em>.</span>
```

### Composants Vue

Vous pouvez utiliser des composants Vue enregistrés globalement ou localement au sein de la page où vous affichez votre Markdown.

Étant donné que `@nuxt/content` fonctionne selon l'hypothèse que tout Markdown est fourni par l'auteur (et non par un utilisateur tiers), les sources sont traitées dans leur intégralité (balises incluses), avec certaines mises en garde de [rehype-raw](https : //github.com/rehypejs/rehype-raw):

1. Vous devez faire référence à vos composants en utilisant la syntaxe kebab case:

```html
Utilisez <mon-composant> à la place de <MonComposant>
```

2. Vous ne pouvez pas utiliser des balises auto-fermantes, par exemple, **ceci ne fonctionnera pas**:

```html
<mon-composant/>
```

Mais **ceci fonctionnera**:

```html
<mon-composant></mon-composant>
```

**Exemple:**

Disons que nous avons un composant Vue nommé [ExampleMultiselect.vue](https://github.com/nuxt/content/blob/master/docs/components/examples/ExampleMultiselect.vue):

```md[home.md]
Veuillez choisir un *framework*:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>
```

**Résultat:**

<div class="border rounded-md p-2 mb-2 bg-gray-200 dark:bg-gray-800">
Veuillez choisir un <i>framework</i>:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>

</div>

Vous pouvez également défnir les options pour les composants au sein de votre front matter:

```md[home.md]
---
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

<example-multiselect :options="multiselectOptions"></example-multiselect>
```

<example-multiselect :options="multiselectOptions"></example-multiselect><br>

<base-alert type="info">

Ces composents seront rendus en utilisant le composant `<nuxt-conent>`, voir [afficher du contenu](/displaying#component).

</base-alert>

Notez également que vous **ne pouvez pas utiliser** de balises `<template>` dans votre Markdown (exemple: avec l'utilisation de `v-slot`).

### Table des matières

Une propritété tabulaire `toc` (pour *Table of Content*) sera injectée au sein de votre document, listant toutes les balises `h2` et `h3` avec leurs titres et ids, afin que vous puissiez créer des liens vers eux.

> Jetez un coup d'oeil sur le côté droit de cette page par exemple.

### Exemple

Un fichier `content/accueil.md`:

```md
---
title: Accueil
---

## Bienvenue!
```

Sera transformé en:

```json
{
  "dir": "/",
  "slug": "accueil",
  "path": "/accueil",
  "extension": ".md",
  "title": "Accueil",
  "toc": [
    {
      "id": "accueil",
      "depth": 2,
      "text": "Bienvenue!"
    }
  ],
  "body": {
    "type": "root",
    "children": [
      {
        "type": "element",
        "tag": "h2",
        "props": {
          "id": "bienvenue"
        },
        "children": [
          {
            "type": "element",
            "tag": "a",
            "props": {
              "ariaHidden": "true",
              "href": "#bienvenue",
              "tabIndex": -1
            },
            "children": [
              {
                "type": "element",
                "tag": "span",
                "props": {
                  "className": [
                    "icon",
                    "icon-link"
                  ]
                },
                "children": []
              }
            ]
          },
          {
            "type": "text",
            "value": "Bienvenue!"
          }
        ]
      }
    ]
  }
}
```

En interne, nous associons une clé `text` avec le corps du Markdown afin de pouvoir l'utiliser pour la [recherche](/fetching#searchfield-value) ou pour créer des [hooks](/advanced#contentfilebeforeinsert).

Vous pouvez découvrir la façon d'afficher du Markdown au sein de vos applications dans la section [afficher du contenu](/displaying).

## CSV

Les lignes seront assignée à la variable `body`.

### Exemple

Un fichier `content/accueil.csv`:

```csv
titre, description
Accueil, Bienvenue!
```

Sera transformé en:

```json
{
  "dir": "/",
  "slug": "accueil",
  "path": "/accueil",
  "extension": ".csv",
  "body": [
    {
      "title": "Accueil",
      "description": "Bienvenue!"
    }
  ]
}
```

## YAML

Les données seront injectées au sein du document.

> La propriété `body` ne sera pas générée.

### Exemple

Un fichier `content/accueil.yaml`:

```yaml
title: Accueil
description: Bienvenue!
```

Sera transformé en:

```json
{
  "dir": "/",
  "slug": "accueil",
  "path": "/accueil",
  "extension": ".yaml",
  "title": "Accueil",
  "description": "Bienvenue!"
}
```

## JSON / JSON5

Les données seront injectées au sein du document.

> La propriété `body` ne sera pas générée.

### Exemple

Un fichier `content/accueil.json`:

```json
{
  "title": "Accueil",
  "description": "Bienvenue!"
}
```

Sera transformé en:

```json
{
  "dir": "/",
  "slug": "accueil",
  "path": "/accueil",
  "extension": ".json",
  "title": "Accueil",
  "description": "Bienvenue!"
}
```
