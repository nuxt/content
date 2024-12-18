<template>
  <div>
    <h2 class="text-lg font-semibold mt-5">
      Features
    </h2>
    <UAccordion
      :items="features"
      multiple
    />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  features: {
    type: Array as PropType<{
      label: string
      content: string
    }[]>,
    default: () => [],
  },
})
</script>
