<script lang="ts" setup>
const route = useRoute()
const { data } = await useAsyncData('posts-' + route.path, () => {
  return queryCollection('posts')
    .path(route.path)
    .first()
})
</script>

<template>
  <UContainer class="max-w-3xl mx-auto">
    <h1 class="text-4xl font-bold text-center my-8">
      <span>My Blog </span>
    </h1>
    <article class="prose prose-invert">
      <MDCRenderer
        :body="data.body"
        :data="data"
      />
    </article>
  </UContainer>
</template>
