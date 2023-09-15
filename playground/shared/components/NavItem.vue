<script setup lang="ts">
import type { NavItem } from '../../../src/runtime/types'

const props = defineProps<{
  navItem: NavItem
}>()
const icon = computed(() => {
  if (props.navItem.icon) { return props.navItem.icon }
  if (props.navItem.children && props.navItem.children.length) { return '📁' }
  return '📄'
})
</script>

<template>
  <li>
    <div v-if="navItem.children && navItem.children.length">
      <span>{{ icon }}</span> <span class="title">{{ navItem.title }}</span>
    </div>
    <NuxtLink v-else :to="navItem._path">
      <span>{{ icon }}</span> <span class="title">{{ navItem.title }}</span>
    </NuxtLink>

    <ul v-if="navItem.children">
      <NavItem v-for="item of navItem.children" :key="item._path" :nav-item="item" />
    </ul>
  </li>
</template>

<style scoped>
ul {
  margin: 0;
  padding-left: 20px;
}
li {
  list-style-type: none;
  padding: 0.15rem 0.5rem;
}
a {
  text-decoration: none;
}
.title {
  display: inline-block;
  margin-left: 4px;
  font-family: sans-serif;
}
a .title {
  text-decoration: underline;
}
.router-link-exact-active {
  font-weight: bold;
}
</style>
