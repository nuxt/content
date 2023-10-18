<script setup>
const title = 'Playground'
const description = 'Play online with our interactive Nuxt Content playground.'
useSeoMeta({
  title: `${title} - Nuxt Content`,
  ogTitle: 'Nuxt Content Playground',
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
      <iframe
        class="dark:bg-gray-950"
        :src="`https://stackblitz.com/github/nuxt/starter/tree/content?embed=1&pages%2F%5B...slug%5D.vue&theme=${$colorMode.preference}`"
        width="100%"
        height="100%"
      />
    </ClientOnly>
  </div>
</template>
