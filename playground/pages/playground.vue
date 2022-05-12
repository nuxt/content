<script setup>
const INITIAL_CODE = `---
title: What is Nuxt Content?
---

# MDC

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

## Next steps
- [Install Nuxt Content](/docs/getting-started)
- [Explore the MDC syntax](/docs/syntax)
`
const content = ref(INITIAL_CODE)
const { data: document, refresh } = await useAsyncData('playground', () => {
  return $fetch('/api/parse', {
    method: 'POST',
    body: {
      content: content.value
    }
  })
})
const tab = ref('preview')
const tabs = ref(['preview', 'AST'])
</script>

<template>
  <div class="playground">
    <textarea v-model="content" @input="refresh" />
    <div class="tabs">
      <button v-for="name in tabs" :key="name" :class="{ active: name === tab }" @click="tab = name">
        {{ name }}
      </button>
      <Document v-if="tab === 'preview'" v-model="document" />
      <pre v-else>{{ document }}</pre>
    </div>
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  align-items: stretch;
}
textarea {
  width: 50%;
  min-height: 100vh;
  background: #fafafa;
  border: 0;
  padding: 5px;
}
.tabs {
  padding: 10px;
  width: 50%;
}
</style>
