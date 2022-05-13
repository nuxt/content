<script setup lang="ts">
const route = useRoute()
const open = ref(false)
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
watch(() => route.path, () => (open.value = false))
</script>

<template>
  <details style="padding: 1rem; margin-bottom: 0 !important;" :open="open" @click.prevent="open = !open">
    <summary>
      <NuxtLink to="/">
        Navigation
      </NuxtLink>
    </summary>

    <span>📌 Current page: <b>{{ $route.path }}</b></span>
    <ul>
      <NavItem :nav-item="{ path: '/playground', title: 'Playground', icon: '📝' }" />
      <NavItem v-for="item of navigation" :key="item.path" :nav-item="item" />
    </ul>
  </details>
</template>

<style scoped>
ul {
  margin: 0;
  padding: 0;
}
</style>
