<template>
  <div>
    <h1>Nuxt Content v3 — multiple sources</h1>
    <p>
      This example declares two collections in <code>content.config.ts</code>:
    </p>
    <ul>
      <li>
        <strong>docs</strong> — the <a href="https://content.nuxt.com">content.nuxt.com</a> documentation,
        fetched from the <code>nuxt/content</code> GitHub repository.
      </li>
      <li>
        <strong>blog</strong> — local markdown files in <code>content/blog</code>.
      </li>
    </ul>

    <h2>Latest posts</h2>
    <ul>
      <li
        v-for="post in posts"
        :key="post.path"
      >
        <NuxtLink :to="post.path">
          {{ post.title }}
        </NuxtLink>
        <small> — {{ post.date }}</small>
      </li>
    </ul>

    <p>
      <NuxtLink to="/docs/getting-started/installation">
        Read the docs →
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { data: posts } = await useAsyncData('latest-posts', () => {
  return queryCollection('blog').all()
})
</script>
