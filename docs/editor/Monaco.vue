<script setup lang="ts">

const emit = defineEmits<(e: 'change', content: string) => void>()

const editorLoading = ref(true)

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
          editorLoading.value = false
        }
      })

      watch(
        () => props.value,
        () => setContent(props.value)
      )

      emit('change', props.value)
    } catch (_) {
      editorLoading.value = 'error'
    }
  }
)
</script>

<template>
  <div class="relative h-full w-full">
    <div v-if="editorLoading === true" class="absolute left-0 top-0 h-full w-full flex justify-center items-center">
      <Alert type="primary">
        <span>Editor is loading</span>
        <Icon name="file-icons:sandbox" class="ml-2 inline" />
      </Alert>
    </div>

    <div v-else-if="editorLoading === 'error'" class="absolute left-0 top-0 h-full w-full flex justify-center items-center">
      <Alert type="warning">
        <span>Error while loading editor!</span>
        <Icon name="heroicons-outline:cog" class="inline ml-2" />
      </Alert>
    </div>
    <div ref="target" class="h-full w-full" />
  </div>
</template>
