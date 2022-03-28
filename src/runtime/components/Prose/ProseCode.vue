<script setup lang="ts">
import { hash } from 'ohash'
import { highlightCode } from '#imports'

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

const key = `highlighted-code-${hash([props.code, props.language, propes.filename, props.highlights])}`
const { data: highlightedCode } = await useAsyncData(key, () => highlightCode(props.code, { lang: props.language }))
</script>

<template>
  <div>
    <pre><code>
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
    </code></pre>
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
  padding: 1rem 0;
}

code {
  display: flex;
  flex-direction: column;
}

.line {
  display: inline-table;
  min-height: 15px;
  padding: 0 1rem;
}

.line.highlight {
  background-color: #3f3f46;
}
</style>
