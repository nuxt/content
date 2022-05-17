<template>
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div v-if="prevNext[0]">
      <NuxtLink :to="prevNext[0].path">
        {{ prevNext[0].title }}
      </NuxtLink>
    </div>
    <div v-else>
      No previous page!
    </div>

    <div v-if="prevNext[1]">
      <NuxtLink :to="prevNext[1].path">
        {{ prevNext[1].title }}
      </NuxtLink>
    </div>
    <div v-else>
      No next page!
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { data: prevNext } = await useAsyncData(`prev-next-${props.document.path}`, () => queryContent().findSurround(props.document.path))
</script>
