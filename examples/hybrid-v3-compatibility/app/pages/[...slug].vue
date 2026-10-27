<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
  <div v-else>
    Page not found
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(() => `page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})
</script>
