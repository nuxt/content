<script lang="ts" setup>
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
