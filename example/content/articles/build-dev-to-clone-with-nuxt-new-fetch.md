---
title: "Build a DEV.TO clone with Nuxt new fetch"
description: Let’s build a blazing fast articles and tutorials app using Nuxt, Dev.to API, with lazy loading, placeholders, caching and trendy neumorphic design UI.
imgUrl: blog/build-dev-to-clone-with-nuxt-new-fetch/main.png
date: 2020-04-08
authors:
  - sergeybedritsky
  - atinux
tags:
  - Nuxt
  - Fetch
  - Asynchronous Data Fetching
  - API
---

*Let’s build a blazing fast articles and tutorials app using Nuxt, Dev.to API, with lazy loading, placeholders, caching and trendy neumorphic design UI.*


<video src="https://nuxtjs.org/blog/build-dev-to-clone-with-nuxt-new-fetch/dev-clone-nuxt.mp4" autoplay loop playsinline controls></video>

<p align="center">
  <a href="https://boyps.sse.codesandbox.io" target="_blank" rel="noopener nofollow">View demo</a> /
  <a href="https://github.com/bdrtsky/nuxt-dev-to-clone" target="_blank" rel="noopener nofollow">Source</a>
</p>

This article is intended to demonstrate use cases and awesomeness of new NuxtJS `fetch` functionality  [introduced in release v2.12](https://nuxtjs.org/api/pages-fetch#nuxt-gt-2-12), and show you how to apply its power in your own projects. For in-depth technical analysis and details of the new `fetch` you can check [Krutie Patel’s article](https://nuxtjs.org/blog/understanding-how-fetch-works-in-nuxt-2-12).

Here’s the high-level outline of how we will build our dev.to clone using `fetch` hook. We will:

* use `$fetchState` for showing nice placeholders while data is fetching on the client side
* use `keep-alive` and `activated` hook to efficiently cache API requests on pages that have already been visited
* reuse the `fetch` hook with `this.$fetch()`
* set `fetchOnServer` value to control when we need to render our data on the server side or not
* find a way to handle errors from `fetch` hook.

## DEV.TO API

In September 2019 DEV.TO  [opened](https://twitter.com/bendhalpern/status/1176663688742395904)  their public API that we can now use to access articles, users and other resources data. *Please note that it’s still Beta, so it could change in future or some things might not work as expected.*

For creating our DEV.TO clone we are interested in such API endpoints:

* [getArticles](https://docs.dev.to/api/#operation/getArticles): to access a list of articles, filtered by the `tag`, `state`, `top`, `username` and paginated with `page` parameters
* [getArticleById](https://docs.dev.to/api/#operation/getArticleById): to access an article content
* [getUser](https://docs.dev.to/api/#operation/getUser): to access user data
* [getCommentsByArticleId](https://docs.dev.to/api/#operation/getCommentsByArticleId): to fetch comments related to the article


To keep it simple, for communication with DEV.TO API we will use native Javascript  [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) .

## Setting up the Project

If you are an experienced developer you can skip this part and [get straight to the point](#developing-the-application).

Make sure you have Node and npm installed. We will use `create-nuxt-app` to  [initialize](/guide/installation#using-code-create-nuxt-app-code-)  the project, so just type the following command in terminal:

```
npx create-nuxt-app nuxt-dev-to-clone
# leave the default answers for each question
```

Now `cd nuxt-dev-to-clone/` and run `npm run dev`. Congrats, your Nuxt app is running on [http://localhost:3000](http://localhost:3000/)!

Let’s install necessary packages and discuss how we will build our app next.

### CSS Styles

For styling we will use the most common CSS preprocessor Sass/SCSS and leverage Vue.js [Scoped CSS](https://vue-loader.vuejs.org/guide/scoped-css.html) feature, to keep our components styles incapsulated. To [use Sass/SCSS with Nuxt](/faq/pre-processors) run:

```
npm i -D sass sass-loader
```

We also will use [@nuxtjs/style-resources](https://github.com/nuxt-community/style-resources-module) module that will help us to use our design tokens defined in SCSS variables in any Vue file without the necessity of using `@import` statements in each file.

```
npm i -D @nuxtjs/style-resources
```

Now tell Nuxt to use it by adding this code to `nuxt.config.js`

```js
buildModules: [
  '@nuxtjs/style-resources'
]
```

Read more about this module [here](https://github.com/nuxt-community/style-resources-module#scss-example), regarding `buildModules`, you can learn more on it in the [modules vs buildModules](/api/configuration-modules#-code-buildmodules-code-) section of the documentation.

Let’s define our design tokens as SCSS variables, put them in `~/assets/styles/tokens.scss` and tell `@nuxtjs/style-resources` to load them by adding to `nuxt.config.js`

```js
styleResources: {
  scss: ['~/assets/styles/tokens.scss']
}
```

Our design tokens are now available through SCSS variables in every Vue component.

### UI Design

It will be kinda boring just to copy existing DEV.TO design and layout, so why don’t we experiment a little bit. You have probably already heard of the new UI trend — neumorphism. If you missed it somehow, read more about it [here](https://uxdesign.cc/neumorphism-in-user-interfaces-b47cef3bf3a6).

We can find a lot of [dribbble shots](https://dribbble.com/tags/neumorphism) (from where this trend came from), but still only a few examples of real-world web apps built with neumorphism style interface, so we just can’t miss the chance to recreate it with CSS and Vue.js. It’s simple, clean and fresh.

I am not going to describe the styling aspect of this application in detail, but if you are interested, you can check this awesome article from  [CSS Tricks](https://css-tricks.com/neumorphism-and-css/) about neumorphism and CSS.

### SVG icons

For SVG icons lets use [@nuxt/svg](https://github.com/nuxt-community/svg-module). This module allows us to import `.svg` files as inline SVG, while keeping SVG sources in single place and not polluting Vue template markup with loads of SVG code.

```
npm i -D @nuxtjs/svg
```

`nuxt.config.js`

```js
buildModules: [
  '@nuxtjs/svg',
  '@nuxtjs/style-resources'
]
```

### Dependencies

To keep front-end app fast and simple we will use only two dependencies, both from Vue.js core members:

* [vue-observe-visibility](https://github.com/Akryum/vue-observe-visibility) by [Guillaume Chau](https://twitter.com/Akryum), for effective detecting elements in viewport with IntersectionObserver and trigger lazy loading. Only 1.6kB gzipped
* [vue-content-placeholders](https://github.com/michalsnik/vue-content-placeholders) by [Michał Sajnóg](https://twitter.com/michalsnik), for showing nicely animated placeholders for UI elements while content is fetching. Only 650B gzipped.

Let’s add them as Nuxt [plugins](https://nuxtjs.org/api/configuration-plugins#__layout), by creating two files.

`vue-observe-visibility.client.js`:

```js
import Vue from 'vue'
import VueObserveVisibility from 'vue-observe-visibility'

Vue.use(VueObserveVisibility)
```

`vue-placeholders.js`:

```js
import Vue from 'vue'
import VueContentPlaceholders from 'vue-content-placeholders'

Vue.use(VueContentPlaceholders)
```

And add them to `nuxt.config.js`

```js
plugins: [
  '~/plugins/vue-placeholders.js',
  '~/plugins/vue-observe-visibility.client.js'
]
```

## Developing the Application

Now we finally can start developing our DEV.TO clone powered by Nuxt and [new fetch](/api/pages-fetch).

### URL structure

Let’s imitate DEV.TO URL structure for our simple app. Our [pages](https://nuxtjs.org/guide/views#pages) folder should look like this:

```
├── index.vue
├── t
│   └── _tag.vue
├── top.vue
└── _username
    ├── _article.vue
    └── index.vue
```

We will have 2 [static pages](https://nuxtjs.org/guide/routing#basic-routes):

* `index.vue`: latest articles about Nuxt.js will be listed
* `top.vue`: most popular articles for last year period.

For the rest of the app URL’s we will use convenient Nuxt file based [dynamic routes](https://nuxtjs.org/guide/routing#dynamic-routes) feature to scaffold necessary pages by creating such file structure:

* `_username/index.vue` - user profile page with list of his published articles
* `_username/_article.vue` - this is where article, author profile and comments will be rendered
* `t/_tag.vue` - list of best articles by any tag that exist on DEV.TO

That’s all. Pretty simple, right?

### Caching requests with `keep-alive` and `activated` hook

One of the coolest practical features of the new `fetch` is its ability to work with `keep-alive` directive to save `fetch` calls on pages you have already visited. Let’s apply this feature in `layouts/default.vue` layout like this.

```html
<template>
  <nuxt keep-alive />
</template>
```

With this directive `fetch` will trigger only on the first page visit, after that Nuxt will save rendered components in memory, and on every subsequent visit it will be just reused from the cache. Could it be simpler than that?

Moreover, Nuxt gives us fine grained control over `keep-alive` with the `keep-alive-props` property where you can set the number of components which you want to cache, and `activated` hook, where you can control TTL (time to live) of the cache. We will use the latest one in our app in the next sections.

### Using `fetch` in page components

Let’s dive into the `fetch` feature itself.

Currently as you can see from the [final result](https://boyps.sse.codesandbox.io/) we have 3 page components that basically reuse the same code — it’s the `index.vue`, `top.vue` and `t/_tag.vue` page components. They simply render a list of article preview cards.

`index.vue`

```html
<template>
  <div class="page-wrapper">
    <div class="article-cards-wrapper">
	    <article-card-block
	      v-for="(article, i) in articles"
	      :key="article.id"
	      :article="article"
	      class="article-card-block"
	    />
	  </div>
  </div>
</template>

<script>
import ArticleCardBlock from '@/components/blocks/ArticleCardBlock'

export default {
  components: {
    ArticleCardBlock
  },
  data() {
    return {
      currentPage: 1,
      articles: []
    }
  },
  async fetch() {
    const articles = await fetch(`https://dev.to/api/articles?tag=nuxt&state=rising&page=${this.currentPage}`).then((res) => res.json())

    this.articles = this.articles.concat(articles)
  }
}
</script>
```

Pay attention to this code block:

```js
async fetch() {
	const articles = await fetch(`https://dev.to/api/articles?tag=nuxt&state=rising&page=${this.currentPage}`).then((res) => res.json())

  this.articles = this.articles.concat(articles)
}
```

Here we are making a request to DEV.TO `/articles` endpoint, with query parameters that API understands. Don’t confuse `fetch` hook with the Javascript [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) interface which simply helps us to send a request to DEV.TO API, and then parse the response with `res.json()`.

Also notice that the new `fetch` hook doesn’t serve just to dispatch Vuex store action or committing mutation to set state, now it has access to `this` context, and is able to mutate component’s data directly. This is a very important new feature, and you can [read more](/blog/understanding-how-fetch-works-in-nuxt-2-12) about it in the previous article about `fetch`.

Now let’s markup the `<article-card-block>` component which receives `article` prop and renders its data nicely.

`ArticleCardBlock.vue`

```html
<template>
  <nuxt-link :to="{ name: 'username-article', params: { username: article.user.username, article: article.id } }" tag="article" >
    <div class="image-wrapper">
      <img v-if="article.cover_image" :src="article.cover_image" :alt="article.title" />
      <img v-else :src="article.social_image" :alt="article.title" />
    </div>
    <div class="content">
      <nuxt-link :to="{name: 'username-article', params: { username: article.user.username, article: article.id } }">
        <h1>{{ article.title }}</h1>
      </nuxt-link>
      <div class="tags">
        <nuxt-link v-for="tag in article.tag_list" :key="tag" :to="{ name: 't-tag', params: { tag } }" class="tag">
          #{{ tag }}
        </nuxt-link>
      </div>
      <div class="meta">
        <div class="scl">
          <span>
            <heart-icon />
            {{ article.positive_reactions_count }}
          </span>
          <span>
            <comments-icon />
            {{ article.comments_count }}
          </span>
        </div>
        <time>{{ article.readable_publish_date }}</time>
      </div>
    </div>
  </nuxt-link>
</template>

<script>
import HeartIcon from '@/assets/icons/heart.svg?inline'
import CommentsIcon from '@/assets/icons/comments.svg?inline'

export default {
  components: {
    HeartIcon,
    CommentsIcon
  },
  props: {
    article: {
      type: Object,
      default: null
    }
  }
}
</script>
```

### Reuse `fetch` with `this.$fetch()`

It already should display a list of articles fetched from DEV.TO but it feels like we are not making a full use of this API. Let’s add lazy loading to articles list, and use the pagination parameter provided by this API. So when we scroll to the bottom of the page a new chunk of articles will be fetched and rendered.

To efficiently detect when to fetch the next page it’s better to use [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). For that we will use a previously installed Vue plugin called `vue-observe-visibility` which is basically a wrapper around this API and it will detect when an element is becoming visible or hidden on the page. This plugin provides us a possibility to use `v-observe-visibility` directive on any element, so let’s add it to last `<article-card-block>` component:

`index.vue`

```html
<article-card-block
  v-for="(article, i) in articles"
  :key="article.id"
  v-observe-visibility="
    i === articles.length - 1 ? lazyLoadArticles : false
  "
  :article="article"
  class="article-card-block"
/>
```

As you can guess from the code above, when the last `<article-card-block>` appears in viewport `lazyLoadArticles` will be fired. Let’s look at it:

```js
lazyLoadArticles(isVisible) {
  if (isVisible) {
    if (this.currentPage < 5) {
      this.currentPage++
      this.$fetch()
    }
  }
}
```

And here we see the power of the new `fetch` hook. We can just reuse `$fetch` as a method and fetch the next page when lazy loading is triggered.

### Applying placeholders with `$fetchState`

If you already applied code from the previous section and tried client-side navigation between `index.vue`, `top.vue` and `t/_tag.vue` page components you probably noticed that it shows an empty page for the moment, while it’s waiting for the API request to complete. This is intended behavior, and it’s different from the old `fetch` and `asyncData` hooks that triggered before page navigation.

Thanks to `$fetchState.pending` wisely provided by the `fetch` hook we can use this flag to display a placeholder when fetch is being called on client-side. `vue-content-placeholders` plugin will be used as a placeholder.

`index.vue`

```html
<template>
  <div class="page-wrapper">
    <template v-if="$fetchState.pending">
      <div class="article-cards-wrapper">
        <content-placeholders
          v-for="p in 30"
          :key="p"
          rounded
          class="article-card-block"
        >
          <content-placeholders-img />
          <content-placeholders-text :lines="3" />
        </content-placeholders>
      </div>
    </template>
    <template v-else-if="$fetchState.error">
      <p>{{ $fetchState.error.message }}</p>
    </template>
    <template v-else>
      <div class="article-cards-wrapper">
        <article-card-block
          v-for="(article, i) in articles"
          :key="article.id"
          v-observe-visibility="
            i === articles.length - 1 ? lazyLoadArticles : false
          "
          :article="article"
          class="article-card-block"
        />
      </div>
    </template>
  </div>
</template>
```

We imitate how `<article-card-block>` looks with [vue-content-placeholders components](https://github.com/michalsnik/vue-content-placeholders#available-components-and-properties), and as you could see in source code it will be used in almost every component that uses the `fetch` hook, so let’s not pay attention on those parts of code anymore (they are basically the same in each component).

### Using `fetch` in any other component  🔥

This is probably the most interesting feature of the new `fetch` hook. **We can now use the `fetch` hook in any Vue component without worrying about breaking SSR!** This means far less headache about how to structure your async API calls and components.

To explore this great functionality let’s move to `_username/_article.vue` page component.

```html
<template>
  <div class="page-wrapper">
    <div class="article-content-wrapper">
      <article-block class="article-block" />
      <div class="aside-username-wrapper">
        <aside-username-block class="aside-username-block" />
      </div>
    </div>
    <comments-block class="comments-block" />
  </div>
</template>

<script>
import ArticleBlock from '@/components/blocks/ArticleBlock'
import CommentsBlock from '@/components/blocks/CommentsBlock'
import AsideUsernameBlock from '@/components/blocks/AsideUsernameBlock'

export default {
  components: {
    ArticleBlock,
    CommentsBlock,
    AsideUsernameBlock
  }
}
</script>
```

Here we see no data fetching at all, only a template layout consisting of 3 components: `<article-block/>`, `<aside-username-block/>`, `<comments-block/>`. And each of those components has its own `fetch` hook. With old `fetch` or current `asyncData` earlier we would have to make all three requests to three different DEV.TO endpoints and then pass them to each component as a prop. But now those components are completely encapsulated.

In `<article-block/>` we use `fetch` just like we’d use it in a page component.

```js
async fetch() {
  const article = await fetch(
    `https://dev.to/api/articles/${this.$route.params.article}`
  ).then((res) => res.json())

  if (article.id && article.user.username === this.$route.params.username) {
    this.article = article
    this.$store.commit('SET_CURRENT_ARTICLE', this.article)
  } else {
    // set status code on server
    if (process.server) {
      this.$nuxt.context.res.statusCode = 404
    }
    // throwing an error will set $fetchState.error
    throw new Error('Article not found')
  }
}
```

Now, remember in the section about caching I mentioned that there’s an `activated` hook that can be used for managing TTL of `fetch`? This is example of such usage:

```js
activated() {
	if (this.$fetchState.timestamp <= Date.now() - 60000) {
	  this.$fetch()
	}
}
```

With this code in place we will call fetch again if last fetch was more than 60 sec ago. All other requests within this period will be cached.

There’s also interesting usage of another `fetch` feature called `fetchOnServer` in the `<comments-block>` component. We don’t really want to render this content on the server side, because comments are user generated and could be irrelevant or spammy. We don’t need any SEO for this content block. Now, with the help of mentioned `fetchOnServer` we have such control:

```js
async fetch() {
  this.comments = await fetch(
    `https://dev.to/api/comments?a_id=${this.$route.params.article}`
  ).then((res) => res.json())
},
fetchOnServer: false
```

### Error handling

Last thing that should be mentioned is error handling. You probably already saw that we used error handling above, but let’s pay more attention to this important topic.

As you know, `fetch` is handled at the **component level**, when doing server-side rendering, the parent (virtual) dom tree is already rendered when rendering the component, so we cannot change it by calling `$nuxt.error(...)`, instead we have to **handle the error at the component level**.

`$fetchState.error` is set if an error is thrown in the `fetch` hook, so we can use it in our template to display an error message:

```html
<template>
  <div class=“page-wrapper”>
    <template v-if="$fetchState.pending">
      <!— placeholders goes here —>
    </template>
    <template v-else-if=“$fetchState.error">
      <p>{{ $fetchState.error.message }}</p>
    </template>
    <template v-else>
      <!— fetched content goes here —>
    </template>
  </div>
</template>
```

Then, in our `fetch` hook, we will throw the error if we don't find the article corresponding for the defined author:

```js
async fetch() {
  const article = await fetch(
    `https://dev.to/api/articles/${this.$route.params.article}`
  ).then((res) => res.json())

  if (article.id && article.user.username === this.$route.params.username) {
    this.article = article
  } else {
    // set status code on server
    if (process.server) {
      this.$nuxt.context.res.statusCode = 404
    }
    throw new Error('Article not found')
  }
}
```

Note here that we wrap `this.$nuxt.context.res.statusCode = 404` around `process.server`, this is used to set the HTTP status code on the server-side for correct SEO.

## Conclusion

In this article we explored Nuxt.js new `fetch` and built an app with basic DEV.TO content features and structure using only this `fetch` hook. I hope you got some inspiration to build your own version of DEV.TO. Don’t forget to check out the [source code](https://github.com/bdrtsky/nuxt-dev-to-clone) for a more complete example and functionality.

**What to do next:**

* Read [Krutie Patel article](/blog/understanding-how-fetch-works-in-nuxt-2-12) with in-depth analysis of how new `fetch` hook works
* Check [nuxt-hackernews](https://github.com/nuxt/hackernews) for similar usage of [Hacker News API](https://github.com/HackerNews/API)
* [Subscribe](#subscribe-to-newsletter) to the newsletter to not miss the upcoming articles and resources, I plan to write an article about How to create your personal blog with Nuxt and Dev.to as CMS.
