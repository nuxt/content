<script setup>
const { data: document } = await useAsyncData('home', () => {
  return queryContent('/').findOne()
})
</script>

<template>
  <Content v-if="document" :document="document" />
</template>

<style>
  section, aside {
    margin-left: 2rem;
  }
</style>
