<script setup lang="ts">
import { ref, useAsyncData, queryContent } from '#imports'

const query = ref({
  where: [{
    _partial: false
  }],
  without: ['body', 'excerpt'],
  skip: 0,
  limit: 10
})

const qs = ref(JSON.stringify(query.value, null, 2))
const parseError = ref(null)
const textarea = ref(null)

watch(qs, (value) => {
  try {
    query.value = JSON.parse(value)
    parseError.value = null
  } catch (e: any) {
    parseError.value = e.message
  }
})

const { data: docs } = await useAsyncData('query', () => {
  return queryContent(query.value).find()
}, { watch: [query] })

const tabber = (event: any) => {
  const originalSelectionStart = event.target.selectionStart
  const startText = qs.value.slice(0, event.target.selectionStart)
  const endText = qs.value.slice(event.target.selectionStart)

  qs.value = `${startText}  ${endText}`
  nextTick(() => {
    event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 2
  })
}

const enterer = (event: any) => {
  const originalSelectionStart = event.target.selectionStart
  const startText = qs.value.slice(0, event.target.selectionStart)
  const endText = qs.value.slice(event.target.selectionStart)

  const currentLine = qs.value.slice(0, event.target.selectionStart).split('\n').pop() || ''
  const lastChar = qs.value.slice(Math.max(0, event.target.selectionStart - 1), event.target.selectionStart)
  // Count the number of spaces at the beggining of the current line
  let nbSpaces = currentLine.match(/^\s*/)?.[0].length || 0
  // If the last character is a colon, add one tab
  if (['[', '{'].includes(lastChar)) {
    nbSpaces += 2
  }
  const tabs = ' '.repeat(nbSpaces)

  qs.value = `${startText}\n${tabs}${endText}`
  nextTick(() => {
    event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1 + nbSpaces
  })
}
</script>

<template>
  <div
    class="query-playground"
    style="height: calc(100vh - 60px); max-height: calc(100vh - 60px); display: flex; flex-direction: column;"
  >
    <div class="query-builder">
      <div class="editor">
        <span v-if="parseError" style="color: orange; margin-left: 1rem;">
          {{ parseError }}
        </span>
        <span v-else style="color: green; margin-left: 1rem;">
          JSON valid.
        </span>
        <textarea ref="textarea" v-model="qs" @keydown.enter.prevent="enterer($event)" @keydown.tab.prevent="tabber($event)" />
      </div>

      <pre>{{ docs }}</pre>
    </div>
  </div>
</template>

<style scoped>
.query-builder {
  display: flex;
  align-items: stretch;
  height: 100%;
  flex: 1;
}

.query-builder .editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 50%;
  border-radius: 0;
}

.query-builder .editor textarea {
  flex: 1;
  margin-bottom: 0;
}

.query-builder pre {
  flex: 1;
  width: 50%;
  padding: 1rem;
  margin-bottom: 0;
}
</style>
