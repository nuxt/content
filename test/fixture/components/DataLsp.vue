<template>
  <span class="data-lsp" :data-lsp="lsp"><slot /></span>
</template>

<script>
export default {
  props: {
    lsp: {
      type: String,
      required: true
    }
  }
}
</script>
