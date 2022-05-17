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
    <div v-if="navItem.children && navItem.children.length">
      <span>{{ icon }}</span> <span class="title">{{ navItem.title }}</span>
    </div>
    <NuxtLink v-else :to="navItem.path">
      <span>{{ icon }}</span> <span class="title">{{ navItem.title }}</span>
    </NuxtLink>

    <ul v-if="navItem.children">
      <NavItem v-for="item of navItem.children" :key="item.path" :nav-item="item" />
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
