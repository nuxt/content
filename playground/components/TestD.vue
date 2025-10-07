<script lang="ts" setup>
defineProps<{
  msg: string
  count: number
  disabled: boolean
  /**
   * FOOOOOO
   */
  foo: string[]
  /**
   * BARRRRR
   */
  bar?: number
}>()
</script>

<template>
  <span class="text-green-500">
    Test C <slot />
  </span>
</template>
