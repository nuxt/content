<template>
  <DocusContent :document="page" />
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'

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
