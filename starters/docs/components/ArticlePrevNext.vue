<template>
  <div class="flex justify-between items-center mt-8">
    <NuxtLink
      v-if="prev"
      :to="localePath({ name: 'index-slug', params: { slug: prev.slug !== 'index' ? prev.slug : undefined } })"
      class="text-green-500 font-bold hover:underline flex items-center"
    >
      <icon-arrow-left class="w-4 h-4 mr-1" />
      {{ prev.title }}
    </NuxtLink>
    <span v-else>&nbsp;</span>
    <NuxtLink
      v-if="next"
      :to="localePath({ name: 'index-slug', params: { slug: next.slug !== 'index' ? next.slug : undefined } })"
      class="text-green-500 font-bold hover:underline flex items-center"
    >
      {{ next.title }}
      <icon-arrow-right class="w-4 h-4 ml-1" />
    </NuxtLink>
    <span v-else>&nbsp;</span>
  </div>
</template>

<script>
export default {
  props: {
    prev: {
      type: Object,
      default: () => null
    },
    next: {
      type: Object,
      default: () => null
    }
  }
}
</script>
