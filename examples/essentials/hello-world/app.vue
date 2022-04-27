<script setup>
const { data: document } = await useAsyncData('home', () => {
  return queryContent().where({ slug: '/' }).findOne()
})
</script>

<template>
  <div>
    <Content v-if="document" :document="document" />
  </div>
</template>
