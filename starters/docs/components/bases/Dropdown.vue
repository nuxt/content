<template>
  <div
    v-click-away="{
      exclude: [],
      handler: 'close'
    }"
    class="relative"
    @mouseover="open = true"
    @mouseout="open = false"
    @keydown.escape="open = false"
  >
    <slot name="trigger" :toggle="toggle" :open="open" />

    <div v-show="open" :class="dropdownClass" class="rounded-md shadow-lg z-50">
      <div class="rounded-md bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import ClickAway from '../directives/click-away'

export default {
  name: 'Dropdown',
  directives: {
    'click-away': ClickAway
  },
  props: {
    position: {
      type: String,
      default: 'left',
      validator (value) {
        return ['left', 'right'].includes(value)
      }
    }
  },
  data () {
    return {
      open: false
    }
  },
  computed: {
    dropdownClass () {
      return ({
        right: 'origin-top-right absolute right-0',
        left: 'origin-top-left absolute left-0'
      })[this.position]
    }
  },
  methods: {
    toggle () {
      this.open = !this.open
    },
    close () {
      this.open = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
