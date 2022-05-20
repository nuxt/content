<script setup lang="ts">

const emit = defineEmits<(e: 'change', content: string) => void>()

const props = defineProps<{ language: string; value: string, readOnly: boolean }>()

const target = ref()

onMounted(
  async () => {
    const { useMonaco } = await import('./useMonacoEditor')

    const { setContent } = useMonaco(target, {
      language: props.language,
      code: props.value,
      readOnly: props.readOnly,
      onChanged (content: string) {
        emit('change', content)
      }
    })

    watch(
      () => props.value,
      () => setContent(props.value)
    )

    emit('change', props.value)
  }
)
</script>

<template>
  <div ref="target" class="h-full w-full" />
</template>
