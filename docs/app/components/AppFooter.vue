<script setup lang="ts">
const route = useRoute()

// const items = [{
//   label: 'Figma Kit',
//   to: 'https://www.figma.com/community/file/1288455405058138934',
//   target: '_blank'
// }, {
//   label: 'Playground',
//   to: 'https://stackblitz.com/edit/nuxt-ui',
//   target: '_blank'
// }, {
//   label: 'Roadmap',
//   to: '/roadmap'
// }, {
//   label: 'Releases',
//   to: '/releases'
// }]
</script>

<template>
  <USeparator
    icon="i-simple-icons-nuxtdotjs"
    class="h-px"
  />

  <UFooter>
    <template #left>
      <NuxtLink
        v-if="route.path.startsWith('/pro')"
        to="https://content.nuxt.com/pro/purchase"
        target="_blank"
        class="text-sm text-[--ui-text-muted]"
      >
        Purchase <span class="text-[--ui-text-highlighted]">Nuxt Content Pro</span>
      </NuxtLink>
      <NuxtLink
        v-else
        to="https://github.com/nuxt/content"
        target="_blank"
        class="text-sm text-[--ui-text-muted]"
      >
        Published under <span class="text-[--ui-text-highlighted]">MIT License</span>
      </NuxtLink>
    </template>

    <!-- <UNavigationMenu :items="items" variant="link" color="neutral" /> -->

    <template #right>
      <UButton
        aria-label="Nuxt Content on Discord"
        icon="i-simple-icons-discord"
        to="https://go.nuxt.com/discord"
        target="_blank"
        color="neutral"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on BlueSKy"
        icon="i-simple-icons-bluesky"
        to="https://go.nuxt.com/bluesky"
        target="_blank"
        color="neutral"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://go.nuxt.com/x"
        target="_blank"
        color="neutral"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Content on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/content"
        target="_blank"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
