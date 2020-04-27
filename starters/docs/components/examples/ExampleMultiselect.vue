<template>
  <multiselect v-model="value" :options="options"></multiselect>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  components: { Multiselect },
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      value: null
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
