<script setup>
const { path } = defineProps({
  path: {
    type: String,
    default: () => useRoute().path
  }
})
const isPartial = path.includes('/_')
const { data: document } = await useAsyncData(`content-doc-${path}`, () => {
  return queryContent().where({ path, partial: isPartial }).findOne()
})
// Head management
if (document.value) {
  const head = document.value.head || {}

  head.title = head.title || document.value.title
  head.meta = head.meta || []
  if (document.value.description && head.meta.filter(m => m.name === 'description').length === 0) {
    head.meta.push({
      name: 'description',
      content: document.value.description
    })
  }

  useHead(head)
}
</script>

<template>
  <Document v-if="document" v-model="document" />
  <div v-else>
    Not Found!
    <!-- TODO: slot -->
  </div>
</template>
