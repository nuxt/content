<script lang="ts" setup>
const route = useRoute()
const pageId = computed(() => 'blog-' + route.path)
const { data: post } = await useAsyncData(pageId, () => {
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
