<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
</script>

<template>
  <div>
    <h1>
      <NuxtLink to="/">
        Navigation
      </NuxtLink>
    </h1>

    <p>📌 Current page: <b>{{ $route.path }}</b></p>

    <ul>
      <NavItem v-for="item of navigation" :key="item.slug" :nav-item="item" />
    </ul>
  </div>
</template>

<style scoped>
ul {
  margin: 0;
  padding: 0;
}
</style>
