<template>
  <ul class="mt-4 list-none">
    <li v-for="(item, i) in items" :key="i" class="mt-3 flex"><icon-check></icon-check>{{ item }}</li>
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
