<template>
  <div class="page">
    <ContentDoc />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  layoutTransition: false
})
</script>

<style>
.page {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  padding: 0;
  margin: 0;
}
</style>
