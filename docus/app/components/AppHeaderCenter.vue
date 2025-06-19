<script setup lang="ts">
const route = useRoute()

const links = computed(() => [
  {
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs'),
  }, {
    label: 'Studio',
    icon: 'i-lucide-file-pen-line',
    children: [{
      icon: 'i-lucide-mouse-pointer-click',
      label: 'Features',
      description: 'Everything you need to edit your Nuxt Content project',
      to: '/studio',
    }, {
      label: 'Pricing',
      description: 'Free for personal use, paid plans for teams',
      icon: 'i-lucide-rocket',
      to: '/studio/pricing',
    }],
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
