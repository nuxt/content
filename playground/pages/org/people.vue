<script setup lang="ts">
const { data: tmpContent } = await useAsyncData('tmp-content', () => queryCollection('people').all())
</script>

<template>
  <div>
    <h1>People</h1>
    <pre>{{ tmpContent }}</pre>
  </div>
</template>
