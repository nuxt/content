<script setup lang="ts">
const { pathname } = useRequestURL()
const { data: page } = await useAsyncData(pathname, () => content.get(pathname))
</script>

<template>
  <ContentDocument
    v-if="page"
    :value="page"
  />
</template>
