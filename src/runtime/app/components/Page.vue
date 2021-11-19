<template>
  <DocusContent :document="page" />
</template>

<script lang="ts">
import { defineComponent } from '#app'

export default defineComponent({
  props: {
    page: {
      type: Object,
      required: true
    }
  },
  templateOptions: {
    aside: false,
    asideClass: '',
    fluid: false
  }
})
</script>
