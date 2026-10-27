<template>
  <div>
    <nav>
      <NuxtLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
      >
        {{ link.title }}
      </NuxtLink>
    </nav>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: links } = await useAsyncData('links', () => {
  return queryCollection('content').select('path', 'title').order('path', 'ASC').all()
})
</script>

<style>
nav {
  display: flex;
  gap: 1rem;
}
</style>
