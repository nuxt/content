<script setup>
const props = defineProps({
  type: {
    type: String,
    default: () => '',
  },
})

const alertClass = computed(() => {
  return {
    warning: 'bg-orange-100 border-orange-200 dark:bg-orange-900 dark:border-orange-800',
    info: 'bg-blue-100 border-blue-200 dark:bg-blue-900 dark:border-blue-800',
    success: 'bg-green-100 border-green-200 dark:bg-green-900 dark:border-green-800',

  }[props.type]
})
</script>

<template>
  <div
    class="text-black p-2 border dark:text-white rounded"
    :class="alertClass"
  >
    <slot mdc-unwrap="p" />
  </div>
</template>
