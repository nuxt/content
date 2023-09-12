<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  source: {
    type: Object as PropType<{ type: string; src: string }>,
    default: () => ({}),
  },
  poster: {
    type: String,
    default: '',
  },
})

const videoWrapper = ref()
const videoPlayer = ref()
</script>

<template>
  <div
    ref="videoWrapper"
    class="relative flex items-center justify-center border border-slate-200/10 rounded-xl bg-slate-700/20"
  >
    <div class="p-4">
      <video
        ref="videoPlayer" :poster="poster" :src="source.src" :type="source.type" controls
        class="rounded-lg bg-slate-800" autoplay muted
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
video[poster] {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
