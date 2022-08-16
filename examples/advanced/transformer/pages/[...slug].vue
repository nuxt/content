<template>
  <div class="content-page">
    <ContentDoc v-slot="{ doc }">
      <div>
        {{ doc }}
      </div>
    </ContentDoc>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  layoutTransition: false
})
</script>

<style>
.content-page {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  padding: 1rem;
  margin: 0;
}
</style>
