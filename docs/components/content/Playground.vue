<script setup>
import { ref, useAsyncData, shallowRef, computed, onMounted, watch, useRoute } from '#imports'
import { parse } from '../../../src/runtime/markdown-parser'
import { useShiki } from '../../editor/useShiki.ts'

const INITIAL_CODE = `---
title: MDC
---

# {{ $doc.title}}

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

## Next steps

- [Install Nuxt Content](/get-started)
- [Explore the MDC syntax](/guide/writing/mdc)

::code-group
  \`\`\`markdown [Source]
  ::alert{type="success"}
    Hooray!
  ::
  \`\`\`

  ::code-block{label="Preview"}
    ::alert{type="success"}
      Hooray!
    ::
  ::
::
`
const shiki = await useShiki()
const route = useRoute()

const content = ref(route.query.content || INITIAL_CODE)

const { data: doc, refresh } = await useAsyncData('playground-' + content.value, async () => {
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
      ...parsed.meta || {},
      ...parsed
    }
  } catch (e) {
    return doc.value
  }
})

const tab = ref(0)

const tabs = ref([{ label: 'Preview' }, { label: 'AST' }])

const astEditorComponent = shallowRef()

const docJSON = computed(() => {
  return JSON.stringify(doc.value, null, 2)
})

const updateTab = async (index) => {
  tab.value = index
  if (tab.value === 1 && !astEditorComponent.value) {
    const { default: component } = await import('~/editor/Editor.vue')

    astEditorComponent.value = component
  }
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
    <div class="flex items-center">
      <TabsHeader class="flex-1 w-1/2" :tabs="[{ label: 'Editor' }]" :active-tab-index="0" />
      <TabsHeader class="flex-1 w-1/2" :tabs="tabs" :active-tab-index="tab" @update:active-tab-index="updateTab" />
    </div>
    <div class="flex overflow-hidden flex-1">
      <div ref="editor" class="relative w-1/2 flex-1">
        <component :is="editorComponent" v-if="editorComponent" v-model="content" />
        <div v-else class="absolute left-0 top-0 h-full w-full flex justify-center items-center">
          <Alert type="primary">
            <span>Editor is loading...</span>
            <Icon name="file-icons:sandbox" class="ml-2 inline" />
          </Alert>
        </div>
      </div>
      <div class="w-1/2 flex-1 overflow-y-auto">
        <ContentRenderer v-if="tab === 0" :key="doc.updatedAt" class="docus-content p-8" :value="doc">
          <template #empty>
            <div class="p-8">
              <Alert type="warning">
                <p class="font-semibold">
                  Content is empty!
                </p>
                <br><br>
                <p>
                  Type any <span class="font-semibold">Markdown</span> or <span class="font-semibold">MDC code</span> in editor to see it replaced by rendered nodes in this panel.
                </p>
              </Alert>
            </div>
          </template>
        </ContentRenderer>
        <component
          :is="astEditorComponent"
          v-else-if="astEditorComponent"
          language="json"
          read-only
          :model-value="docJSON"
        />
        <!-- <pre v-if="tab === 1">{{ doc }}</pre> -->
      </div>
    </div>
  </div>
</template>
