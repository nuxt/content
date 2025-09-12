<script setup lang="ts">
const { data } = await useAsyncData('tmp-content', () => queryCollection('org').all())
</script>

<template>
  <div>
    <h1>People</h1>
    <pre>{{ data }}</pre>
  </div>
</template>
