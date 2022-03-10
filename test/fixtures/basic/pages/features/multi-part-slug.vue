<template>
  <Content :id="content.id" />
</template>

<script setup lang="ts">
const content = await useContentQuery('cats', 'persian').findOne()
</script>
