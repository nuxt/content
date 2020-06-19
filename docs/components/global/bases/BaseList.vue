<template>
  <ul class="mt-4 list-none">
    <li v-for="(item, i) in items" :key="i" class="mt-3 flex">
      <IconCheck class="h-6 w-6 mt-px mr-3 flex-shrink-0" />
      {{ item }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>
