<script setup lang="ts">
import ProseCode from '@nuxtjs/mdc/runtime/components/prose/ProseCode.vue'
</script>

<template>
  <ProseCode v-bind="$attrs">
    <slot />
  </ProseCode>
</template>
