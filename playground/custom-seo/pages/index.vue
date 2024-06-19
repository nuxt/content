<script lang="ts" setup>
import { useServerHead } from '#imports'

useServerHead({
  title: 'My custom title',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: 'My custom description'
    }
  ]
})
</script>

<template>
  <ContentDoc />
</template>
