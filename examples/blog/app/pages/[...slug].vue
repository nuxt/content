<script lang="ts" setup>
const route = useRoute()
const { data: post } = await useAsyncData(computed(() => 'blog-' + route.path), () => {
  return queryCollection('blog')
    .path(route.path)
    .first()
})
</script>

<template>
  <div>
    <nuxt-link to="/">
      <small>« Back </small>
    </nuxt-link>
    <h1>{{ post.title }}</h1>
    <ContentRenderer :value="post" />
  </div>
</template>
