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
@import "vue-multiselect/dist/vue-multiselect.min.css";
/* purgecss end ignore */

.multiselect {
  & ul {
    @apply m-0 p-0;

    & li {
      @apply m-0 p-0;

      &::before {
        @apply hidden;
      }
    }
  }
}
</style>
