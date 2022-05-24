<script setup>
const { data: navigation } = await useAsyncData('navigation', () => {
  return fetchContentNavigation()
})
</script>

<template>
  <NuxtExampleLayout example="navigation/fetch-content-navigation" repo="nuxt/content">
    <main class="text-left">
      <nav>
        <AppNavigation :navigation-tree="navigation" />
      </nav>
    </main>
  </NuxtExampleLayout>
</template>
