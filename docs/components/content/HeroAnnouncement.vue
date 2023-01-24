<script setup>
defineProps({
  to: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <NuxtLink :to="to" class="link">
    <Icon name="heroicons-solid:sparkles" class="icon" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<style scoped lang="ts">
css({
  '.link': {
    color: '{color.primary.900}',
    backgroundColor: '{color.primary.100}',
    borderColor: '{color.primary.400}',
    borderRadius: '{radii.md}',
    borderWidth: '{borderWidth.sm}',
    borderStyle: 'solid',
    display: 'inline-flex',
    padding: '{space.2} {space.4}',
    marginBottom: '{space.4}',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '{space.1}',

    '@dark': {
      color: '{color.primary.100}',
      backgroundColor: 'transparent',
      borderColor: '{color.primary.700}'
    },

    '&:hover': {
      backgroundColor: '{color.primary.200}',
      '@dark': {
        backgroundColor: '{color.primary.900}'
      },
    }
  },
  '.link span': {
    // font-medium text-sm
    fontWeight: '{fontWeight.medium}',
    fontSize: '{fontSize.sm}'
  },
  '.link .icon': {
    width: '{space.4}',
    height: '{space.4}'
  }
})
</style>
