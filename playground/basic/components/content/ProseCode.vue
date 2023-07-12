<script lang="ts" setup>
defineProps<{
    code: string,
    language?: string,
    filename?: string,
    highlights: number[],
    meta?: string
  }>()
</script>

<template>
  <span v-if="filename"> {{ filename }} </span>
  <slot />
</template>

<style>
pre code .line {
  display: block;
  min-height: 1rem;
}
</style>
