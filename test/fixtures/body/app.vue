<script setup lang="ts">
const { data: page } = await useAsyncData('page', () => queryCollection('docs').path('/').first())
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
