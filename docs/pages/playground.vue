<script setup>
const title = 'Playground'
const description = 'Play online with our interactive Nuxt DevTools playground.'
useSeoMeta({
  titleTemplate: '%s - Nuxt DevTools',
  title,
  ogTitle: `Nuxt DevTools Playground`,
  description
})
defineOgImage({
  component: 'Docs',
  title,
  description
})
</script>

<template>
  <div class="h-[calc(100vh-var(--header-height))] flex dark:bg-gray-950">
    <ClientOnly>
      <iframe class="dark:bg-gray-950" :src="`https://stackblitz.com/github/nuxt/starter/tree/v3?embed=1&file=app.vue&theme=${$colorMode.preference}`" width="100%" height="100%" />
    </ClientOnly>
  </div>
</template>
