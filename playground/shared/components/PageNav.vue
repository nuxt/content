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
    <details ref="navEl" style="margin: 0 !important; padding: 0 !important; user-select: none;">
      <summary style="height: 59px !important; display: flex; align-items: center; margin-bottom 0 !important;">
        <NuxtLink style="margin-left: 1rem;" to="/">
          Navigation
        </NuxtLink>
      </summary>

      <div style="padding: 0 1rem; margin-top: -1rem;">
        <ul>
          <NavItem v-for="item of navigation" :key="item._path" :nav-item="item" />
        </ul>
      </div>
    </details>
  </ContentNavigation>
</template>

<style scoped>
ul {
  margin: 0;
  padding: 0;
}
</style>
