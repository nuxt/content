<template>
  <div>
    <hr>
    <pre>{{ list }}</pre>
    <hr>
  </div>
</template>

<script setup lang="ts">
const { data: list } = await useAsyncData('yaml-list', () => queryContent('yaml').find())
</script>
