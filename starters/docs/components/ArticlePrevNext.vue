<template>
  <div class="flex justify-between items-center mt-8">
    <NuxtLink
      v-if="prev"
      :to="`/${prev.slug}`"
      class="text-green-500 font-bold hover:underline flex items-center"
    >
      <icon-arrow-left />
      {{ prev.title }}
    </NuxtLink>
    <span v-else>&nbsp;</span>
    <NuxtLink
      v-if="next"
      :to="`/${next.slug}`"
      class="text-green-500 font-bold hover:underline flex items-center"
    >
      {{ next.title }}
      <icon-arrow-right />
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
