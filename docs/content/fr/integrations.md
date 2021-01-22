---
title: Intégrations
description: "Apprenez comment utiliser @nuxt/content avec d'autres modules."
position: 13
category: Community
---

## @nuxtjs/feed

Dans le cas d'articles, le contenu peut être utilisé pour générer des fils d'actualités 
en utilisant le module [@nuxtjs/feed](https://github.com/nuxt-community/feed-module).

<alert type="info">

Pour utiliser `$content` à l'intérieur de l'option `feed`, vous devez ajouter `@nuxt/content` avant `@nuxtjs/feed` dans la propriété `modules`. 

</alert>

Vous pouvez accéder à votre flux via : `baseUrl + baseLinkFeedArticles + file`

Pour RSS: ```https://mywebsite.com/feed/articles/rss.xml```

Pour JSON: ```https://mywebsite.com/feed/articles/feed.json```

**Exemple 1**

```js
export default {
  modules: [
    '@nuxt/content',
    '@nuxtjs/feed'
  ],

  feed () {
    const baseUrlArticles = 'https://mywebsite.com/articles'
    const baseLinkFeedArticles = '/feed/articles'
    const feedFormats = {
      rss: { type: 'rss2', file: 'rss.xml' },
      json: { type: 'json1', file: 'feed.json' },
    }
    const { $content } = require('@nuxt/content')

    const createFeedArticles = async function (feed) {
      feed.options = {
        title: 'My Blog',
        description: 'I write about technology',
        link: baseUrlArticles,
      }
      const articles = await $content('articles').fetch()

      articles.forEach((article) => {
        const url = `${baseUrlArticles}/${article.slug}`

        feed.addItem({
          title: article.title,
          id: url,
          link: url,
          date: article.published,
          description: article.summary,
          content: article.summary,
          author: article.authors,
        })
      })
    }

    return Object.values(feedFormats).map(({ file, type }) => ({
      path: `${baseLinkFeedArticles}/${file}`,
      type: type,
      create: createFeedArticles,
    }))
  }
}
```

L'approche ci-dessus fonctionne bien pour certains cas d'utilisation. Cependant, si vous utilisez `npm run generate`, cette approche produira une erreur.

Ou, si vous souhaitez inclure le corps de l'article en tant que contenu, y compris le contenu des composants si vous mélangez vos composants Vue et votre markdown, vous devrez aborder cela différemment.

Une façon possible pour faire cela est d'utiliser l'approche documentée de [@nuxtjs/feed](https://github.com/nuxt-community/feed-module) qui fonctionnera avec `npm run generate` et utilisera le processus de Nuxt pour inclure le contenu. Voici comment procéder.

Tout d'abord, utilisez l'approche basée sur les tableaux pour déclarer vos flux comme indiqué dans la documentation @nuxtjs/feed. Le tableau de flux se compose d'objets avec 5 valeurs possibles.

1. Le `path` qui le chemin de votre nom de domaine vers le flux de votre document.
2. Une fonction qui générera le contenu du flux.
3. Le `cacheTime` qui comme son nom l'indique détermine quand le flux doit être actualisé.
4. Le `type` qui détermine quel type de flux rss que vous souhaitez générer.
5. Les `data` qui sont fournies comme argument à la fonction (la propriété args dans l'exemple ci-dessous)

```js
modules: [    
    '@nuxt/content',
    '@nuxtjs/feed'    
  ],

  feed: [
    {
      path: '/feed.xml',
      async create(feed, args) => {  
        // create the feed
      },
      cacheTime: 1000 * 60 * 15,
      type: 'rss2',
      data: [ 'some', 'info' ]
    },
    {
      path: '/feed.json',
      async create(feed, args) => {  
        // create the feed
      },
      cacheTime: 1000 * 60 * 15,
      type: 'json1',
      data: [ 'other', 'info' ]
    }
  ],
```

Vous pouvez tirer le meilleur de l'API nuxt/content, mais en déclarant votre fonction `create` séparément, puis en la fournissant à l'objet de tableau de flux. La fonction `create` peut être déclarée en haut du fichier nuxt.config.js, ou séparément dans un autre répertoire et exportée. Cette fonction `create` s'exécute _après_ que le processus Nuxt a compilé les composants markdown et Vue en HTML. Cela nous permet d'extraire ce contenu et de le fournir au flux.

**Exemple 2**

```js
// this Exemple declares the function at the top of the nuxt.config.js file
const fs = require('fs').promises;
const path = require('path');

let posts = [];

const constructFeedItem = async (post, dir, hostname) => {  
  //note the path used here, we are using a dummy page with an empty layout in order to not send that data along with our other content
  const filePath = path.join(__dirname, `dist/rss/${post.slug}/index.html`); 
  const content = await fs.readFile(filePath, 'utf8');
  const url = `${hostname}/${dir}/${post.slug}`;
  return {
    title: post.title,
    id: url,
    link: url,
    description: post.description,
    content: content
  }
} 

const create = async (feed, args) => {
  const [filePath, ext] = args;  
  const hostname = process.NODE_ENV === 'production' ? 'https://my-production-domain.com' : 'http://localhost:3000';
  feed.options = {
    title: "My Blog",
    description: "Blog Stuff!",
    link: `${hostname}/feed.${ext}`
  }
  const { $content } = require('@nuxt/content')
  if (posts === null || posts.length === 0)
    posts = await $content(filePath).fetch();

  for (const post of posts) {
    const feedItem = await constructFeedItem(post, filePath, hostname);
    feed.addItem(feedItem);
  }
  return feed;
}

export default {
...
  modules: [    
    '@nuxt/content',
    '@nuxtjs/feed'    
  ],
  feed: [
    {
      path: '/feed.xml',
      create
      cacheTime: 1000 * 60 * 15,
      type: 'rss2',
      data: [ 'blog', 'xml' ]
    },
  ],  
...
}
```

Il y a cependant deux inconvénients à cette approche :

1. Puisque vous lisez la totalité de la page générée, vous pouvez récupérer du contenu indésirable tel que celui de l'en-tête et du pied de page. Une façon de résoudre ce problème consiste à créer une page factice en utilisant une mise en page vide afin que seul le contenu que vous souhaitez inclure dans le flux rss soit utilisé.
2. rss2 et XML fonctionnent bien car le HTML est automatiquement encodé. Cependant, json1 et json peuvent nécessiter du travail supplémentaire pour que le contenu puisse être transmis.

N'oubliez pas également que si vous n'utilisez pas de contenu mixte dans votre markdown (donc si vous n'utilisez que du markdown), il est beaucoup plus facile d'inclure uniquement celui-ci. Vous pouvez récupérer le markdown en utilisant ce hook dans votre nuxt.config.js :

**Exemple 3**

```js
export default {
...
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {      
        document.bodyPlainText = document.text;
      }
    },
  },
...
}
```

Et puis dans votre fonction `create` :

```js

const constructFeedItem = (post, dir, hostname) => {  
  const url = `${hostname}/${dir}/${post.slug}`;
  return {
    title: post.title,
    id: url,
    link: url,
    description: post.description,
    content: post.bodyPlainText
  }
} 

const create = async (feed, args) => {
  const [filePath, ext] = args;  
  const hostname = process.NODE_ENV === 'production' ? 'https://my-production-domain.com' : 'http://localhost:3000';
  feed.options = {
    title: "My Blog",
    description: "Blog Stuff!",
    link: `${hostname}/feed.${ext}`
  }
  const { $content } = require('@nuxt/content')
  if (posts === null || posts.length === 0)
    posts = await $content(filePath).fetch();

  for (const post of posts) {
    const feedItem = await constructFeedItem(post, filePath, hostname);
    feed.addItem(feedItem);
  }
  return feed;
}
```

Récupérer uniquement le markdown fonctionne très bien si vous utilisez le flux pour intégrer [dev.to](https://dev.to/) ou [medium](https://medium.com/) puisque ces deux sites utiliser markdown dans leurs éditeurs.


## @nuxtjs/sitemap

Vous souhaiterez peut-être générer un plan du site contenant des liens vers tous vos articles. Vous pouvez le faire de la même manière que vous avez généré votre flux.

**Exemple 1**

Le module du plan du site doit toujours être déclaré en dernier afin que les routes créées par d'autres modules puissent être incluses. Après avoir déclaré le module, vous devez configurer le plan du site en ajoutant l'objet de configuration du plan du site dans nuxt.config.js. Vous devez fournir le nom d'hôte et vous pouvez éventuellement inclure toutes les routes générées dynamiquement à partir de nuxt-content.
La propriété routes accepte une fonction asynchrone qui renvoie un tableau d'URL.

```js
const createSitemapRoutes = async () => {
  let routes = [];
  const { $content } = require('@nuxt/content')
  if (posts === null || posts.length === 0)
    posts = await $content('blog').fetch();
  for (const post of posts) {
    routes.push(`blog/${post.slug}`);
  }
  return routes;
}

export default {
...
  modules: [
    '@nuxt/content',
    '@nuxtjs/sitemap'
  ],
  sitemap: {
    hostname: 'https://my-domain-name.com',
    gzip: true,
    routes: createSitemapRoutes
  },
...
}
```

## Forestry CMS

Vous pouvez intégrer Nuxt Content avec [Forestry](https://forestry.io) en quelques étapes.

<alert>

Nous vous recommandons de jeter un œil à ce tutoriel réalisé par [Pascal Cauhépé](https://twitter.com/eQRoeil)

👉 &nbsp;https://nuxt-content-and-forestry.netlify.app

</alert>
