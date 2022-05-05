<script setup>
const { previewToken } = defineProps({
  previewToken: {
    type: Object,
    required: true
  }
})
const open = ref(true)
const closePreviewMode = () => {
  open.value = false
  previewToken.value = null
}
</script>

<template>
  <div v-if="open" class="preview">
    Preview mode activated. <button @click="closePreviewMode">
      close
    </button>
  </div>
</template>

<style scoped>
.preview {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: black;
  color: white;
  padding: 10px;
}
</style>
