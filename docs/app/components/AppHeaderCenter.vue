<script setup lang="ts">
const route = useRoute()

const links = computed(() => [
  {
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs') && !route.path.startsWith('/docs/studio'),
  }, {
    label: 'Studio',
    badge: {
      label: 'alpha',
      color: 'primary',
    },
    icon: 'i-lucide-file-pen-line',
    to: '/docs/studio/setup',
    active: route.path.startsWith('/docs/studio'),
  }, {
    label: 'Templates',
    icon: 'i-lucide-layout-template',
    to: '/templates',
  }, {
    label: 'Blog',
    icon: 'i-lucide-file-text',
    to: '/blog',
  },
])
</script>

<template>
  <UNavigationMenu
    :items="links"
    variant="link"
  />
</template>
