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
    color: '{colors.primary.900}',
    backgroundColor: '{colors.primary.100}',
    borderColor: '{colors.primary.400}',
    borderRadius: '{radii.md}',
    borderWidth: '{borderWidths.sm}',
    borderStyle: 'solid',
    display: 'inline-flex',
    padding: '{space.2} {space.4}',
    marginBottom: '{space.4}',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '{space.1}',

    '@dark': {
      color: '{colors.primary.100}',
      backgroundColor: 'transparent',
      borderColor: '{colors.primary.700}'
    },

    '&:hover': {
      backgroundColor: '{colors.primary.200}',
      '@dark': {
        backgroundColor: '{colors.primary.900}'
      },
    }
  },
  '.link span': {
    // font-medium text-sm
    fontWeight: '{fontWeights.medium}',
    fontSize: '{fontSizes.sm}'
  },
  '.link .icon': {
    width: '{space.4}',
    height: '{space.4}'
  }
})
</style>
