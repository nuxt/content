<template>
  <li>
    <span v-if="navItem.children && navItem.children.length">{{ navItem.title }}</span>
    <NuxtLink v-else :to="navItem.slug">
      {{ navItem.title }}
    </NuxtLink>

    <ul v-if="navItem.children">
      <NavItem v-for="item of navItem.children" :key="item.slug" :nav-item="item" />
    </ul>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  navItem: any
}>()
</script>
