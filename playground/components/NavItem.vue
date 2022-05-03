<script setup lang="ts">
const { navItem } = defineProps<{
  navItem: any
}>()
const icon = computed(() => {
  if (navItem.icon) { return navItem.icon }
  if (navItem.children && navItem.children.length) { return '📁' }
  return '📄'
})
</script>

<template>
  <li>
    <span v-if="navItem.children && navItem.children.length"><span>{{ icon }}</span> {{ navItem.title }}</span>
    <NuxtLink v-else :to="navItem.slug">
      <span>{{ icon }}</span> {{ navItem.title }}
    </NuxtLink>

    <ul v-if="navItem.children">
      <NavItem v-for="item of navItem.children" :key="item.slug" :nav-item="item" />
    </ul>
  </li>
</template>
