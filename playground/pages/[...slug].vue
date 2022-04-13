<template>
  <div>
    <Content v-if="document" :document="document" />
    <div v-else>
      Not Found!
    </div>
    <PagePrevNext v-if="document" :document="document" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: document } = await useAsyncData(route.path, () => {
  return queryContent(route.path).findOne()
})
</script>
