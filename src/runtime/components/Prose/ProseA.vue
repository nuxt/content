<script setup lang="ts">
defineProps({
  href: {
    type: String,
    default: ''
  },
  blank: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <ClientOnly>
    <NuxtLink :href="href">
      <slot />
    </NuxtLink>
  </ClientOnly>
</template>
