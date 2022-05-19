<script setup>
const PARSE_SERVER = 'https://mdc.nuxt.dev/api/parse'

const INITIAL_CODE = `# MDC

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

::alert
You can use any component from here!

oh my god
::
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
</script>

<template>
  <div class="flex gap-8 min-h-[500px] p-8 bg-blue-500">
    <textarea v-model="content" class="surface block flex-1 w-1/2" @input="refresh" />

    <ContentRenderer class="playground-content block flex-1 w-1/2" :value="doc">
      <template #empty>
        <div>Content is empty.</div>
      </template>
    </ContentRenderer>
  </div>
</template>

<style lang="postcss" scoped>
.playground-content {
  :first-child {
    @apply mt-0 !important;
  }
}
</style>
