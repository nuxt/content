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
const { data: links } = await useAsyncData('links', async () => {
  const files = await content.list()
  return files
    .map(file => ({ path: file.path, title: file.data.title as string }))
    .sort((a, b) => a.path.localeCompare(b.path))
})
</script>

<style>
nav {
  display: flex;
  gap: 1rem;
}
</style>
