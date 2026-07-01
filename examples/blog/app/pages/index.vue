<script lang="ts" setup>
const { data: posts } = await useAsyncData(() => {
  return queryCollection('blog')
    .select('title', 'description', 'path', 'id', 'date', 'image')
    .order('date', 'DESC')
    .all()
})
</script>

<template>
  <div>
    <h1>Blog</h1>
    <article
      v-for="post in posts"
      :key="post.id"
      style="margin-bottom: 2rem;"
    >
      <nuxt-link :to="post.path">
        <img
          :src="post.image"
          :alt="post.title"
          style="max-width: 320px; height: auto; border-radius: 8px; display: block;"
        >
        <strong>{{ post.title }}</strong>
      </nuxt-link>
      <p>{{ post.description }}</p>
    </article>
  </div>
</template>
