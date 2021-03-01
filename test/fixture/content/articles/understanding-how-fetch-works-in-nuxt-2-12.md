---
title: "Understanding how fetch works in Nuxt 2.12"
description: Explore different features of the fetch hook and learn a brand new way to bring data into Nuxt applications.
imgUrl: blog/understanding-how-fetch-works-in-nuxt-2-12/main.png
date: 2020-04-06
position: 2
authors:
  - name: Krutie Patel
    avatarUrl: https://pbs.twimg.com/profile_images/780651635932434432/YtbSkumD_400x400.jpg
    link: https://twitter.com/KrutiePatel
tags:
  - Nuxt
  - Fetch
  - Asynchronous Data Fetching
  - API
---

Nuxt introduces a new `fetch` with the latest release of version 2.12. Fetch provides a brand new way to bring data into Nuxt applications.

In this post, we will explore different features of the fetch hook and try to understand how it works.

## Fetch Hook and Nuxt Lifecycle

In terms of Nuxt lifecycle hooks, `fetch` sits within Vue lifecycle after `created` hook. As we already know that, all Vue lifecycle hooks are called with their `this` context. The same applies to `fetch` hook as well.

![New fetch in Nuxt lifecycle](https://nuxtjs.org/blog/understanding-how-fetch-works-in-nuxt-2-12/new-fetch-lifecycle-hooks.png)

Fetch hook is called after the component instance is created on the server-side. That makes `this` context available inside the `fetch`.

```js
export default {
  fetch() {
    console.log(this);
  }
};
```

Let’s see what this could mean for page components.

### Page Components

With the help of `this` context, fetch is able to mutate component’s data directly. It means we can set the component’s local data without having to dispatch Vuex store action or committing mutation from the page component.

As a result, Vuex becomes optional, but not impossible. We can still use `this.$store` as usual to access Vuex store if required.

## Availability of fetch hook

With `fetch`, we can pre-fetch the data asynchronously **in any Vue components**. It means, other than page components found in `/pages` directory, every other `.vue` components found in `/layouts` and `/components` directories can also benefit from the fetch hook.

Let's see what this could mean for layout and building-block components.

### Layout Components

Using new `fetch`, now we can make API calls directly from the layout components. This was impossible prior to the release of v2.12.

**Possible use cases**

- Fetch config data from the back-end in Nuxt layouts to generate footer and navbar dynamically
- Fetch user related data (i.e. user profile, shopping-cart item count) in the navbar
- Fetch site relevant data on `layouts/error.vue`

### Building-block (Child/Nested) Components

With `fetch` hook available in child components as well, we can off-load some of the data-fetching tasks from page-level components, and delegate them over to nested components. This was also impossible prior to the release of v2.12.

This reduces the responsibility of route-level components to a great extent.

**Possible use case -** We can still pass props to child components, but if the child components need to have their own data-fetching logic, now they can!

## Call order of multiple fetch hooks

Since each component can have its own data-fetching logic, you may ask what would be the order in which each of them are called?

Fetch hook is called on server-side once (on the first request to the Nuxt app) and then on client-side when navigating to further routes. But since we can define one fetch hook for each component, fetch hooks are called in sequence of their hierarchy.

### Disabling fetch on server-side

In addition, we can even disable fetch on the server-side if required.

```js
export default {
  fetchOnServer: false
};
```

And this way, the fetch hook will only be called on client-side. When `fetchOnServer` is set to false, `$fetchState.pending` becomes `true` when the component is rendered on server-side.

## Error Handling

New `fetch` handles error at component level. Let’s see how.

Because we’re fetching data asynchronously, the new fetch() provides a `$fetchState` object to check whether the request has finished and progressed successfully.

Below is what the `$fetchState` object looks like.

```
$fetchState = {
  pending: true | false,
  error: null | {},
  timestamp: Integer
};
```

We have three keys,

1. **Pending -** lets you display a placeholder when fetch is being called on client-side
2. **Error -** lets you show an error message
3. **Timestamp -** shows timestamp of the last fetch which is useful for caching with `keep-alive`

These keys are then used directly in the template area of the component to show relevant placeholders during the process of fetching data from the API.

```html
<template>
  <div>
    <p v-if="$fetchState.pending">Fetching posts...</p>
    <p v-else-if="$fetchState.error">Error while fetching posts</p>
    <ul v-else>
      …
    </ul>
  </div>
</template>
```

## Fetch as a method

New fetch hook also acts as a method that can be invoked upon user interaction or invoked programmatically from the component methods.

```html
<!-- from template in template  -->
<button @click="$fetch">Refresh Data</button>
```

```js
// from component methods in script section
export default {
  methods: {
    refresh() {
      this.$fetch();
    }
  }
};
```

## Making Nuxt pages more performant

We can use `:keep-alive-props` prop and `activated` hook to make Nuxt page components more performant using a new fetch hook.

Nuxt allows **caching a certain number of pages** in the memory along with their fetched data. And also allows **adding a number of seconds** before we can re-fetch the data.

For any of the above methods to work, we have to use the `keep-alive` prop in generic `<nuxt />` and `<nuxt-child`> components.

```html
<!-- layouts/default.vue -->
<template>
  <div>
    <nuxt keep-alive />
  </div>
</template>
```

In addition, we can pass `:keep-alive-props` to `<nuxt />` component to cache a number of pages along with their fetched data.

`:keep-alive-props` prop allow us to indicate the maximum number of pages that should be kept in the memory while we navigate elsewhere within the site.

```html
<!-- layouts/default.vue -->
<nuxt keep-alive :keep-alive-props="{ max: 10 }" />
```

Above is one way to boost page performance which is more high-level and generic, while the next one drills down to optimise the fetch request calls by using the `timestamp` property of `$fetchState` and comparing it against the number of seconds delay before it re-fetches the data.

Vue’s `activated` hook is used here with Nuxt's `keep-alive` prop to re-fetch the data.

```js
export default {
  activated() {
    // Call fetch again if last fetch more than a minute ago
    if (this.$fetchState.timestamp <= Date.now() - 60000) {
      this.$fetch();
    }
  }
};
```

## asyncData vs Fetch

As far as page components are concerned, new `fetch` seems way too similar to `asyncData()` because they both deal with the local data. But there are some key differences worth taking note of as below.

As of Nuxt 2.12, `asyncData` method is still an active feature. Let’s examine some of the key differences between `asyncData` and new `fetch`.

### AsyncData

1. `asyncData` is limited to only page-level components
2. `this` context is unavailable
3. Adds payload by **returning** the data

```js
export default {
  async asyncData(context) {
    const data = await context.$axios.$get(
      `https://jsonplaceholder.typicode.com/todos`
    );
    // `todos` does not have to be declared in data()
    return { todos: data.Item };
    // `todos` is merged with local data
  }
};
```

### New Fetch

1. `fetch` is available in all Vue components
2. `this` context is available
3. Simply **mutates** the local data

```js
export default {
  data() {
    return {
      todos: []
    };
  },
  async fetch() {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/todos`
    );
    // `todos` has to be declared in data()
    this.todos = data;
  }
};
```

## Fetch before Nuxt 2.12

If you have been working with Nuxt for a while, then you’ll know that the previous version of `fetch` was significantly different.

> **Is this a breaking change?**

> No, it isn't. Actually, the old fetch can still be used by passing the `context` as the first argument to avoid any breaking changes in your existing Nuxt applications.

Here’s the list of notable changes in `fetch` hook compared with **before** and **after** v2.12.

### First

**Before -** `fetch` hook was called before initiating the component, hence `this` wasn’t available inside the fetch hook.

**After -** `fetch` is called after the component instance is created on the server-side when the route is accessed.

### Second

**Before -** We had access to the Nuxt `context` on page-level components, given that the `context` is passed as a first parameter.

```js
export default {
  fetch(context) {
    // …
  }
};
```

**After -** We can access `this` context just like Vue client-side hooks without passing any parameters.

```js
export default {
  fetch() {
    console.log(this);
  }
};
```

### Third

**Before -** Only page (route-level) components were allowed to fetch data on the server-side.

**After -** Now, we can pre-fetch the data asynchronously in any Vue components.

### Fourth

**Before -** `fetch` could be called server-side once (on the first request to the Nuxt app) and client-side when navigating to further routes.

**After -** New `fetch` is the same as an old fetch, but…

…since we can have one `fetch` for each component, `fetch` hooks are called in sequence of their hierarchy.

### Fifth

**Before -** We used the `context.error` function that redirected a page when an error occurred during API calls.

**After -** New `fetch` uses the `$fetchState` object to handle errors in the template area during API calls.

No page redirection is performed during error handling.

> **Does this mean we cannot redirect users to a custom error page like we did prior to Nuxt 2.12?**

Yes, but with `asyncData()` when it's about page-level component data. Simply use `this.$nuxt.error({ statusCode: 404, message: Data not found' })` to redirect and show a custom error page.

## Conclusion

New fetch hook brings a lot of improvements and provides more flexibility in fetching data and organising route-level & building-block components in a whole new way!

It will certainly make you think a little differently when you plan and design your new Nuxt project that requires multiple API calls within the same route.

I hope this article has helped you get acquainted with the new `fetch` feature. I'd love to see what you build with it.