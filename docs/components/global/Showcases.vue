<template>
  <div class="grid lg:grid-cols-2 gap-4">
    <div v-for="(showcase, index) of showcases" :key="index" class="border dark:border-gray-800 rounded-md">
      <a :href="showcase" target="_blank" class="py-1 block">
        <img :src="`${showcase}/preview.png`" class="light-img rounded-md" />
        <img :src="`${showcase}/preview-dark.png`" class="dark-img rounded-md" />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showcases: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
img {
  @apply my-0 !important;
}
</style>
