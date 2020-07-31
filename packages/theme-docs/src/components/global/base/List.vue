<template>
  <div>
    <div v-for="(item, i) in items" :key="i" class="mt-3 flex">
      <IconBadgeCheck class="h-6 w-6 mt-px mr-3 flex-shrink-0 text-green-500" />
      {{ item }}
    </div>
  </div>
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
