<script setup lang="ts">
import { computed } from 'vue'
import { useContentHighlight } from '#imports'

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: null
  },
  filename: {
    type: String,
    default: null
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  }
})

const highlightedCode = await useContentHighlight(
  computed(() => props.code),
  computed(() => props.language)
)
</script>

<template>
  <div>
    <pre>
      <code>
        <span
          v-for="(line, lineIndex) in highlightedCode"
          :key="`line-${lineIndex + 1}`"
          class="line"
          :class="{ 'highlight': highlights.includes(lineIndex + 1) }"
        >
          <span
            v-for="(token, tokenIndex) in line"
            :key="`token-${tokenIndex}`"
            :style="{ color: token.color }"
            v-text="token.content"
          />
        </span>
      </code>
    </pre>
  </div>
</template>

<style scoped>
div {
  display: flex;
  color: #d4d4d4;
}

pre {
  flex: 1 1 0%;
  background-color: #2e3440;
}

code {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.line {
  display: inline-table;
  padding: 0 1rem;
  min-height: 15px;
}

.line.highlight {
  background-color: #3f3f46;
}
</style>
