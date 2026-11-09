<script setup lang="ts">
import { h } from 'vue'

const { data: page } = await useAsyncData('components-prop', () => queryCollection('content').path('/').first())
const CustomHeading = (_: unknown, { slots }: { slots: { default?: () => unknown } }) => h('h3', { class: 'prop-heading' }, slots.default?.())
</script>

<template>
  <ContentDocument
    v-if="page"
    :value="page"
    :components="{ h3: CustomHeading }"
  />
</template>
