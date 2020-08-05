<template>
  <div
    v-if="prev || next"
    class="flex justify-between items-center lg:px-8 pt-4 border-t dark:border-gray-800"
    :class="{
      'lg:border-t-0': settings.layout === 'single'
    }"
  >
    <NuxtLink
      v-if="prev"
      :to="localePath(prev.to)"
      class="text-primary-500 font-bold hover:underline flex items-center lg:p-2 pl-0"
    >
      <IconArrowLeft class="w-4 h-4 mr-1" />
      {{ prev.title }}
    </NuxtLink>
    <span v-else>&nbsp;</span>
    <NuxtLink
      v-if="next"
      :to="localePath(next.to)"
      class="text-primary-500 font-bold hover:underline flex items-center lg:p-2 pr-0"
    >
      {{ next.title }}
      <IconArrowRight class="w-4 h-4 ml-1" />
    </NuxtLink>
    <span v-else>&nbsp;</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
  },
  computed: {
    ...mapGetters([
      'settings'
    ])
  }
}
</script>
