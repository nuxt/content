<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  tabs: {
    type: Array as PropType<{ label: string }[]>,
    required: true
  },
  activeTabIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:activeTabIndex'])

const tabsRef = ref()

const highlightUnderline = ref()

const updateHighlightUnderlinePosition = (activeTab) => {
  // const activeTab = tabsRef.value[props.activeTabIndex]

  if (!activeTab) { return }

  highlightUnderline.value.style.left = `${activeTab.offsetLeft}px`
  highlightUnderline.value.style.top = `${activeTab.offsetTop}px`
  highlightUnderline.value.style.width = `${activeTab.clientWidth}px`
  highlightUnderline.value.style.height = `${activeTab.clientHeight}px`
  highlightUnderline.value.style.transform = 'scale(1)'
  highlightUnderline.value.style.opacity = 1
}

const updateTabs = ($event, i) => {
  emit('update:activeTabIndex', i)
  nextTick(() => updateHighlightUnderlinePosition($event.target))
}

watch(
  tabsRef,
  (newVal) => {
    if (!newVal) {
      return
    }

    setTimeout(() => {
      updateHighlightUnderlinePosition(tabsRef.value.children[props.activeTabIndex])
    }, 50)
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="tabs-header relative bg-gray-800 text-white">
    <div v-if="tabs" ref="tabsRef" class="relative z-0 px-2">
      <button
        v-for="({ label }, i) in tabs"
        :key="`${i}${label}`"
        class="xs:py-3 xs:my-0 relative my-2 rounded-lg px-2 py-1.5 font-mono text-sm tracking-tight focus:outline-none"
        :class="[activeTabIndex === i ? 'text-white' : 'text-gray-200 hover:text-white']"
        @click="updateTabs($event, i)"
      >
        {{ label }}
      </button>
      <span
        ref="highlightUnderline"
        class="highlight-underline xs:py-1.5 absolute -z-[1]"
        :style="{
          transform: `scale(0)`,
          opacity: 0,
        }"
      >
        <span class="flex h-full w-full rounded-lg bg-gray-700 dark:bg-gray-900" />
      </span>
    </div>

    <slot name="footer" />
  </div>
</template>

<style lang="postcss" scoped>
.highlight-underline {
  /* bottom: -2px; */
  /* height: 2px; */
  transition: left 150ms, top 150ms, width 150ms, height 150ms, transform 100ms, opacity 100ms;
}
</style>
