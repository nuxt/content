<template>
  <MDCRenderer
    :body="body"
    :data="data"
    :tag="tag"
    :components="mdcComponents"
    :data-content-id="debug ? value._id : undefined"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContentPreview } from '../composables/preview'

const props = defineProps({
  /**
   * Content to render
   */
  value: {
    type: Object,
    required: true
  },
  /**
   * Render only the excerpt
   */
  excerpt: {
    type: Boolean,
    default: false
  },
  /**
   * Root tag to use for rendering
   */
  tag: {
    type: String,
    default: 'div'
  },
  /**
   * The map of custom components to use for rendering.
   */
  components: {
    type: Object,
    default: () => ({})
  },

  data: {
    type: Object,
    default: () => ({})
  }
})

const debug = process.dev || useContentPreview().isEnabled()

const body = computed(() => {
  let body = props.value.body || props.value
  if (props.excerpt && props.value.excerpt) {
    body = props.value.excerpt
  }

  return body
})

const data = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { body, excerpt, ...data } = props.value
  return {
    ...data,
    ...props.data
  }
})

const mdcComponents = computed(() => {
  return {
    ...props.components,
    ...(data.value._components || {})
  }
})
</script>
