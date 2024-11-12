<script lang="ts" setup>
const { data: posts } = await useAsyncData(() => {
  return queryCollection('blog')
    .select('title', 'description', 'path', 'id', 'date')
    .order('date', 'DESC')
    .all()
})
</script>

<template>
  <div>
    <h1>Blog</h1>
    <p
      v-for="post in posts"
      :key="post.id"
    >
      >
      <nuxt-link :to="post.path">
        <strong>{{ post.title }}</strong>
      </nuxt-link>

      &nbsp;{{ post.description }}
    </p>
  </div>
</template>
