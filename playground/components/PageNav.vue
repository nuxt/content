<template>
  <div>
    <h1>
      <NuxtLink to="/">
        Navigation
      </NuxtLink>
    </h1>

    <span>📌 Current page: <b>{{ $route.path }}</b></span>

    <ul>
      <NavItem v-for="item of navigation" :key="item.slug" :nav-item="item" />
    </ul>
  </div>
</template>

<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => queryContent().findNavigation())
</script>
