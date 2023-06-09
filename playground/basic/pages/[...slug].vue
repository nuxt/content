<template>
  <div class="content-page">
    <ContentDoc>
      <template #not-found>
        <p>Not found!</p>
        <p>
          Go:
          <NuxtLink to="#" @click="$router.go(-1)">
            Back
          </NuxtLink>
          or
          <NuxtLink to="/">
            Home
          </NuxtLink>
        </p>
      </template>
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
