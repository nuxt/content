<script setup>
import { ref, useAsyncData } from '#imports'

const PARSE_SERVER = 'https://mdc.nuxt.dev/api/parse'

const INITIAL_CODE = `# MDC

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

## Next steps
- [Install Nuxt Content](/get-started)
- [Explore the MDC syntax](/guide/writing/mdc)
`
const content = ref(INITIAL_CODE)

const { data: doc, refresh } = await useAsyncData('playground', async () => {
  try {
    return await $fetch(PARSE_SERVER, {
      method: 'POST',
      cors: true,
      body: {
        id: 'content:_file.md',
        content: content.value
      }
    })
  } catch (e) {
    return doc.value
  }
})

const tab = ref('Preview')

const tabs = ref(['Preview', 'AST'])
</script>

<template>
  <div class="playground">
    <textarea v-model="content" @input="refresh" />
    <div class="content">
      <div class="tabs">
        <button
          v-for="name in tabs"
          :key="name"
          class="outline"
          :class="{ active: name === tab }"
          @click="tab = name"
        >
          {{ name }}
        </button>
      </div>

      <ContentRenderer v-if="tab === 'Preview'" :value="doc">
        <template #empty>
          <div>Content is empty.</div>
        </template>
      </ContentRenderer>
      <pre v-if="tab === 'AST'" style="padding: 1rem;">{{ doc }}</pre>
    </div>
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  align-items: stretch;
  flex: 1;
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
}

.playground textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.playground .content {
  flex: 1;
  width: 50%;
  overflow-y: auto;
  padding: 1rem;
}

.playground .tabs {
  display: flex;
  flex-direction: row;
  padding: 1rem;
  gap: 1rem;
}

.playground .tabs > button {
  opacity: 0.75;
}

.playground .tabs > button.active {
  border-width: 2px;
  opacity: 1;
}
</style>
