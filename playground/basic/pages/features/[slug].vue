<template>
  <div class="content-page">
    <ContentRendererMarkdown :value="data" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = await useAsyncData(() => {
  return queryContent('features').where({ _path: `/features/${route.params.slug}` }).findOne()
})
</script>

<style>
.content-page {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  padding: 1rem;
  margin: 0;
}
</style>
