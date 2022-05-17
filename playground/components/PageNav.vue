<script setup lang="ts">
const route = useRoute()

const navEl = ref()

watch(
  () => route.path,
  () => {
    if (!navEl.value || !navEl.value.attributes.open) { return }

    (navEl.value as HTMLElement).attributes.removeNamedItem('open')
  }
)
</script>

<template>
  <ContentNavigation v-slot="{ navigation }">
    <details ref="navEl" style="padding: 1rem; margin-bottom: 0 !important;">
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
  </ContentNavigation>
</template>

<style scoped>
ul {
  margin: 0;
  padding: 0;
}
</style>
