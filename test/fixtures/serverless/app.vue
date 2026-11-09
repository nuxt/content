<script setup lang="ts">
const { data: page } = await useAsyncData('page', () => queryCollection('content').path('/').first())
</script>

<template>
  <ContentDocument
    v-if="page"
    :value="page"
  />
</template>
