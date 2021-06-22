<template>
  <div v-if="settings.slots && settings.slots[name]">
    <component :is="`${settings.slots[name]}`"></component>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'settings'
    ])
  }
}
</script>

<style scoped>

</style>
