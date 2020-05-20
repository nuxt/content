<template>
  <Multiselect v-model="value" :options="options"></Multiselect>
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

<style>
/* purgecss start ignore */
@import 'vue-multiselect/dist/vue-multiselect.min.css';
/* purgecss end ignore */
</style>
