<script setup>
const { data: document } = await useAsyncData('navigation', () => {
  return fetchContentNavigation()
})
</script>

<template>
  <NuxtExampleLayout example="navigation/fetch-content-navigation" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <main class="text-left">
      <nav>
        <pre>{{ document }}</pre>
      </nav>
    </main>
  </NuxtExampleLayout>
</template>
