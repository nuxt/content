---
title: Integrations
description: 'Learn how to use @nuxt/content with other modules.'
position: 13
category: Community
---

## @nuxtjs/feed

In the case of articles, the content can be used to generate news feeds
using [@nuxtjs/feed](https://github.com/nuxt-community/feed-module) module.

<alert type="info">

To use `$content` inside the `feed` option, you need to add `@nuxt/content` before `@nuxtjs/feed` in the `modules` property. 

</alert>

You can access your feed on: `baseUrl + baseLinkFeedArticles + file`

For RSS: ```https://mywebsite.com/feed/articles/rss.xml```

For JSON: ```https://mywebsite.com/feed/articles/feed.json```

**Example 1**

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

The above approach works well for some use cases. However, if you use `npm run generate` then this approach will produce an error.

Or, if you want to include the body of the article as content, including any content from components if you mix your vue components and your markdown then you'll need to approach this differently.

One possible way to do this uses the [@nuxtjs/feed](https://github.com/nuxt-community/feed-module) documented approach and will work well with `npm run generate` and will use the existing Nuxt process to include the content. Here's how to do it.

First, use the array based approach for declaring your feeds as shown in the @nuxtjs/feed documentation. The feed array consists of objects with 5 possible values.

1. The `path` which is the path from your domain to the feed document.
2. A function that will generate the feed content.
3. The `cacheTime` which as the name suggests determines when the feed will be refreshed.
4. The `type` which determines which type of rss feed you intend to output.
5. The `data` which is supplied as arguments to the function (the args property in the example below)

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

You can make the best use of the nuxt/content api but declaring your create function separately and then supplying it to the feed array object. The create function can be declared at the top of the nuxt.config.js file, or separately in another directory and exported. The create function runs _after_ the Nuxt process has compiled the markdown and Vue components into HTML. This allows us to pull in that content and supply it to the feed. 

**Example 2**

```js
// this example declares the function at the top of the nuxt.config.js file
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

There are at least two drawbacks to this approach:

1. Since you're reading in the entire generated page you may pick up undesired content such as from the header and footer. One way to deal with this is to create a dummy page using an empty layout so that only the content you want included in the rss feed is used.
2. rss2 and XML work well because the HTML is automatically encoded. However, json1 and json may need additional work so that the content can be transmitted.

Remember also that if you are not using mixed content in your markdown (so if you are using markdown only), then it is far easier to only include the markdown. You can retrieve the markdown using this hook in your nuxt.config.js:

**Example 3**

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

And then in your create function: 

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
Retrieving just the markdown works great if you're using the feed to integrate with [dev.to](https://dev.to/) or [medium](https://medium.com/) since both of these sites use markdown in their editors.


## @nuxtjs/sitemap

You may want to generate a sitemap that includes links to all of your posts. You can do this in a similar way as you generated the feed.

**Example 1**

The sitemap module should always be declared last so that routes created by other modules can be included. After declaring the module you must configure the sitemap by adding the sitemap configuration object to the nuxt.config.js. You must supply the hostname and you can optionally include any routes that are dynamically generated from nuxt content.
The routes property accepts an async function that returns an array of URLs.

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

You can integrate Nuxt Content with [Forestry](https://forestry.io) in a few steps.

<alert>

We recommend to take a look at this tutorial made by [Pascal Cauhépé](https://twitter.com/eQRoeil)

👉 &nbsp;https://nuxt-content-and-forestry.netlify.app

</alert>
