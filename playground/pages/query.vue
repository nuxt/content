<script setup lang="ts">
const query = ref({
  where: {

    _partial: false
  },
  sort: {
    _path: 1
  },
  only: [],
  without: ['body', 'excerpt'],
  skip: 0,
  limit: 10
})
const qs = ref(JSON.stringify(query.value, null, 2, ''))
const parseError = ref(null)
const textarea = ref(null)

watch(qs, (value) => {
  try {
    query.value = JSON.parse(value)
    parseError.value = null
  } catch (e) {
    parseError.value = e.message
  }
})

const { data: docs } = await useAsyncData('query', () => {
  return queryContent(query.value).find()
}, { watch: [query] })

const tabber = (event) => {
  const originalSelectionStart = event.target.selectionStart
  const startText = qs.value.slice(0, event.target.selectionStart)
  const endText = qs.value.slice(event.target.selectionStart)

  qs.value = `${startText}  ${endText}`
  nextTick(() => {
    event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 2
  })
}
const enterer = (event) => {
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
  <div>
    <div style="padding: 5px 20px;">
      <span v-if="parseError" style="color: orange;">
        {{ parseError }}
      </span>
      <span v-else style="color: green;">
        JSON valid.
      </span>
    </div>
    <div class="query-builder">
      <textarea ref="textarea" v-model="qs" @keydown.enter.prevent="enterer($event)" @keydown.tab.prevent="tabber($event)" />
      <pre>{{ docs }}</pre>
    </div>
  </div>
</template>

<style>
.query-builder {
  display: flex;
  align-items: stretch;
}

textarea {
  flex: 1;
  min-height: 100vh;
  width: 50%;
  border-radius: 0;
}

pre {
  flex: 1;
  width: 50%;
  min-height: 100vh;
  padding: 1rem;
}
</style>
