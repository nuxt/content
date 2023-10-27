<script setup lang="ts">
// @ts-nocheck
const emit = defineEmits<(e: 'change', content: string) => void>()
const editorState = ref('loading')
const props = defineProps<{ language: string; value: string, readOnly: boolean }>()
const target = ref()

onMounted(
  async () => {
    try {
      const { useMonaco } = await import('./useMonacoEditor')

      const { setContent } = useMonaco(target, {
        language: props.language,
        code: props.value,
        readOnly: props.readOnly,
        onChanged (content: string) {
          emit('change', content)
        },
        onDidCreateEditor () {
          editorState.value = 'ready'
        }
      })

      watch(
        () => props.value,
        () => setContent(props.value)
      )

      emit('change', props.value)
    } catch (_) {
      editorState.value = 'error'
    }
  }
)
</script>

<template>
  <div class="editor">
    <div v-if="editorState === 'loading'" class="overlay">
      <Alert type="primary">
        <span>Editor is loading...</span>
        <Icon name="file-icons:sandbox" class="ml-2 inline" />
      </Alert>
    </div>

    <div v-else-if="editorState === 'error'" class="overlay">
      <Alert type="warning">
        <span>Error while loading editor!</span>
        <Icon name="heroicons-outline:cog" class="inline ml-2" />
      </Alert>
    </div>
    <div ref="target" class="editor-target" />
  </div>
</template>

<style scoped lang="ts">
css({
  '.editor': {
    position: 'relative',
    height: '100%',
    width: '100%'
  },
  '.editor-target': {
    height: '100%',
    width: '100%'
  },
  '.overlay': {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
</style>
