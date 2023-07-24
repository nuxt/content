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
  <div v-if="language">
    language <br>
    {{ language }}
  </div>
  <div v-if="filename">
    filename <br>
    {{ filename }}
  </div>
  <div v-if="highlights">
    highlights <br>
    {{ highlights }}
  </div>
  <div v-if="meta">
    meta <br>
    {{ meta }}
  </div>
  <slot />
</template>

<style>
pre code .line {
  display: block;
  min-height: 1rem;
}
</style>
