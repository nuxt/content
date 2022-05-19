<script setup>
import { parse } from '../../../src/runtime/markdown-parser'

definePageMeta({
  layout: 'fluid'
})

const INITIAL_CODE = `# MDC

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

## Next steps
- [Install Nuxt Content](/docs/getting-started)
- [Explore the MDC syntax](/docs/syntax)
`
const shiki = await useShiki()
const content = ref(INITIAL_CODE)

const { data: doc, refresh } = await useAsyncData('playground', async () => {
  try {
    // const startParse = Date.now()
    let parsed = await parse(content.value)
    // const startHighlight = Date.now()
    parsed = await shiki(parsed)

    // console.log(`Parsed: ${startHighlight - startParse}ms, Highlighted: ${Date.now() - startHighlight}ms`)

    return {
      _id: 'content:index.md',
      _path: '/',
      _file: 'index.md',
      _extension: 'md',
      _draft: false,
      _type: 'markdown',
      updatedAt: new Date().toISOString(),
      ...parsed
    }
  } catch (e) {
    return doc.value
  }
})

const tab = ref(0)

const tabs = ref([{ label: 'Preview' }, { label: 'AST' }])

const updateTab = (index) => {
  tab.value = index
}

const editorComponent = shallowRef()

onMounted(async () => {
  const { default: component } = await import('~/editor/Editor.vue')

  editorComponent.value = component
})

watch(content, refresh)
</script>

<template>
  <div class="h-page max-h-page flex flex-col">
    <TabsHeader :tabs="tabs" :active-tab-index="tab" @update:active-tab-index="updateTab" />
    <div class="flex overflow-hidden flex-1">
      <div ref="editor" class="w-1/2 flex-1">
        <component :is="editorComponent" v-if="editorComponent" v-model="content" />
      </div>
      <div class="w-1/2 flex-1 overflow-y-auto">
        <ContentRenderer v-if="tab === 0" :key="doc.updatedAt" class="docus-content p-2" :value="doc">
          <template #empty>
            <div>Content is empty.</div>
          </template>
        </ContentRenderer>
        <div class="p-2 text-sm">
          <pre v-if="tab === 1">{{ doc }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
