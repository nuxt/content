<template>
  <div>
    <h1>
      Navigation
    </h1>

    <span>📌 Current page: <b>{{ $route.path }}</b></span>

    <ul>
      <NavItem v-for="item of navigation" :key="item.slug" :nav-item="item" />
    </ul>
  </div>
</template>

<script setup lang="ts">
const navigation = await useContentNavigation()
</script>
